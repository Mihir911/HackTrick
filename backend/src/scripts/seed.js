import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

dotenv.config();

// Import models
import User from '../models/User.js';
import Video from '../models/Video.js';
import Course from '../models/Course.js';
import Mission from '../models/Mission.js';
import Hackathon from '../models/Hackathon.js';
import { hashPassword } from '../utils/bcrypt.js';
import { generateId, nowIso } from '../utils/helpers.js';
import logger from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Seed the database with initial data
 */
const seedDatabase = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI, {
            dbName: process.env.DB_NAME
        });
        logger.info('✅ Connected to MongoDB');

        // ===== Create Admin User =====
        const adminEmail = process.env.ADMIN_EMAIL || 'admin@hacktrick.io';
        const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@Hack2026';

        let admin = await User.findOne({ email: adminEmail });
        if (!admin) {
            const hashedPassword = await hashPassword(adminPassword);
            admin = new User({
                id: generateId(),
                email: adminEmail,
                name: 'Admin',
                role: 'admin',
                password_hash: hashedPassword,
                xp: 0,
                rank: 'Sysop',
                bio: 'Platform admin',
                avatar_url: null,
                skills: [],
                hr_verified: true
            });
            await admin.save();
            logger.info(`✅ Admin user created: ${adminEmail}`);
        } else {
            logger.info(`✅ Admin user already exists: ${adminEmail}`);
        }

        // ===== Create Demo Users =====
        const demoUsers = [
            { email: 'neo@hacktrick.io', name: 'Neo Anderson', role: 'student', password: 'Password@1', skills: ['web-security', 'sql-injection', 'python'], xp: 1200 },
            { email: 'trinity@hacktrick.io', name: 'Trinity', role: 'researcher', password: 'Password@1', skills: ['reverse-engineering', 'malware'], xp: 1800 },
            { email: 'morpheus@hacktrick.io', name: 'Morpheus', role: 'instructor', password: 'Password@1', skills: ['red-team', 'training'], xp: 2500 },
            { email: 'recruiter@corp.io', name: 'Alice Recruiter', role: 'hr', password: 'Password@1', skills: [], xp: 0 },
            { email: 'cipher@hacktrick.io', name: 'Cipher', role: 'student', password: 'Password@1', skills: ['cryptography', 'ctf'], xp: 800 }
        ];

        for (const demo of demoUsers) {
            let user = await User.findOne({ email: demo.email });
            if (!user) {
                const hashedPassword = await hashPassword(demo.password);
                const rank = getRank(demo.xp);
                user = new User({
                    id: generateId(),
                    email: demo.email,
                    name: demo.name,
                    role: demo.role,
                    password_hash: hashedPassword,
                    xp: demo.xp,
                    rank,
                    bio: `Cybersecurity ${demo.role}.`,
                    avatar_url: null,
                    skills: demo.skills,
                    hr_verified: demo.role === 'hr'
                });
                await user.save();
                logger.info(`✅ Demo user created: ${demo.email}`);
            }
        }

        // ===== Create Missions =====
        const missionsCount = await Mission.countDocuments();
        if (missionsCount === 0) {
            const missions = [
                {
                    id: generateId(),
                    order: 1,
                    title: 'The Corner Bank',
                    location: 'Downtown',
                    x: 22,
                    y: 30,
                    difficulty: 'easy',
                    xp: 100,
                    brief: "The bank's login page seems vulnerable. Bypass authentication with SQL injection.",
                    prompt: "$ curl -X POST http://bank.city/login -d 'user=admin&pass=X'\n> Response: Invalid credentials\n\nHint: Try classic SQLi payloads. What payload as password lets you in as admin?",
                    flag: "' OR '1'='1",
                    category: 'Web Exploitation'
                },
                {
                    id: generateId(),
                    order: 2,
                    title: 'Radio Tower',
                    location: 'Uptown',
                    x: 55,
                    y: 18,
                    difficulty: 'easy',
                    xp: 120,
                    brief: "Intercept a hidden broadcast. Decode the base64 message: aGFja3RyaWNrX3JhZGlv",
                    prompt: "$ echo 'aGFja3RyaWNrX3JhZGlv' | base64 -d\nWhat is the decoded flag?",
                    flag: 'hacktrick_radio',
                    category: 'Cryptography'
                },
                {
                    id: generateId(),
                    order: 3,
                    title: 'The Warehouse',
                    location: 'Industrial District',
                    x: 78,
                    y: 55,
                    difficulty: 'medium',
                    xp: 200,
                    brief: "A network scan is required. Identify the open port. Nmap output shows: PORT 4444/tcp open shell",
                    prompt: "$ nmap -sV 10.10.10.42\nSTATE: open\nSERVICE: shell\nOnly one port. Enter port number.",
                    flag: '4444',
                    category: 'Network Recon'
                },
                {
                    id: generateId(),
                    order: 4,
                    title: 'City Hall Servers',
                    location: 'Government Zone',
                    x: 40,
                    y: 68,
                    difficulty: 'medium',
                    xp: 250,
                    brief: "XSS reflected on the search form. Craft a payload that alerts the string XSS.",
                    prompt: "The form outputs input directly into HTML. What is the shortest classic XSS payload?",
                    flag: "<script>alert('XSS')</script>",
                    category: 'Web Exploitation'
                },
                {
                    id: generateId(),
                    order: 5,
                    title: 'Underground Vault',
                    location: 'Sewers',
                    x: 15,
                    y: 80,
                    difficulty: 'hard',
                    xp: 400,
                    brief: "Reverse a simple hash: sha1('hacktrick') = ??? Enter the first 12 hex characters.",
                    prompt: "$ echo -n 'hacktrick' | sha1sum\n(compute the SHA1 hash of the string 'hacktrick', first 12 hex chars)",
                    flag: '6e6a6b5f2e2a',
                    category: 'Cryptography'
                },
                {
                    id: generateId(),
                    order: 6,
                    title: 'SOC Command Center',
                    location: 'Tech Park',
                    x: 65,
                    y: 72,
                    difficulty: 'medium',
                    xp: 220,
                    brief: "Analyze this log line: 'Failed password for root from 10.0.0.5 port 22'. What port service is being attacked?",
                    prompt: "Log: Failed password for root from 10.0.0.5 port 22\nWhat protocol (lowercase) is being brute-forced?",
                    flag: 'ssh',
                    category: 'SOC Analysis'
                },
                {
                    id: generateId(),
                    order: 7,
                    title: 'Rooftop Antenna',
                    location: 'Skyline',
                    x: 88,
                    y: 25,
                    difficulty: 'hard',
                    xp: 350,
                    brief: "WPA2 handshake captured. Password hint: 'admin default rot13'. What is the password (admin rot13)?",
                    prompt: "ROT13 of 'admin' = ?",
                    flag: 'nqzva',
                    category: 'Wireless'
                }
            ];

            await Mission.insertMany(missions);
            logger.info(`✅ ${missions.length} missions created`);
        }

        // ===== Create Courses =====
        const coursesCount = await Course.countDocuments();
        if (coursesCount === 0) {
            const morpheus = await User.findOne({ email: 'morpheus@hacktrick.io' });
            if (morpheus) {
                const courses = [
                    {
                        id: generateId(),
                        instructor_id: morpheus.id,
                        instructor_name: morpheus.name,
                        title: 'Web Exploitation 101',
                        description: 'Foundations of SQLi, XSS, CSRF, and modern web attacks.',
                        is_free: true,
                        price: 0,
                        difficulty: 'beginner',
                        tags: ['web', 'sqli', 'xss'],
                        thumbnail_url: null,
                        lessons: [
                            { id: generateId(), title: 'Intro to HTTP', duration: '12:04', content: 'HTTP basics and headers.' },
                            { id: generateId(), title: 'SQL Injection Fundamentals', duration: '22:18', content: 'Union, blind, and time-based.' },
                            { id: generateId(), title: 'XSS Deep Dive', duration: '18:45', content: 'Reflected, stored, DOM XSS.' }
                        ],
                        enrollment_count: 0,
                        rating: 4.8
                    },
                    {
                        id: generateId(),
                        instructor_id: morpheus.id,
                        instructor_name: morpheus.name,
                        title: 'Red Team Operations',
                        description: 'Advanced offensive tradecraft: C2, evasion, and lateral movement.',
                        is_free: false,
                        price: 299.0,
                        difficulty: 'advanced',
                        tags: ['red-team', 'c2', 'evasion'],
                        thumbnail_url: null,
                        lessons: [
                            { id: generateId(), title: 'OpSec Fundamentals', duration: '25:00', content: '' },
                            { id: generateId(), title: 'Custom C2 Development', duration: '45:12', content: '' },
                            { id: generateId(), title: 'AV/EDR Evasion', duration: '38:00', content: '' }
                        ],
                        enrollment_count: 0,
                        rating: 4.9
                    },
                    {
                        id: generateId(),
                        instructor_id: morpheus.id,
                        instructor_name: morpheus.name,
                        title: 'SOC Analyst Bootcamp',
                        description: 'Blue-team essentials: SIEM, threat hunting, incident response.',
                        is_free: true,
                        price: 0,
                        difficulty: 'intermediate',
                        tags: ['blue-team', 'soc', 'ir'],
                        thumbnail_url: null,
                        lessons: [
                            { id: generateId(), title: 'Log Analysis 101', duration: '20:00', content: '' },
                            { id: generateId(), title: 'MITRE ATT&CK Walk', duration: '30:00', content: '' }
                        ],
                        enrollment_count: 0,
                        rating: 4.7
                    }
                ];

                await Course.insertMany(courses);
                logger.info(`✅ ${courses.length} courses created`);
            }
        }

        // ===== Create Videos =====
        const videosCount = await Video.countDocuments();
        if (videosCount === 0) {
            const trinity = await User.findOne({ email: 'trinity@hacktrick.io' });
            const neo = await User.findOne({ email: 'neo@hacktrick.io' });

            if (trinity && neo) {
                const videos = [
                    {
                        id: generateId(),
                        owner_id: trinity.id,
                        owner_name: trinity.name,
                        owner_role: 'researcher',
                        title: 'Reversing a Real-World Malware Sample',
                        description: 'A step-by-step walkthrough of static + dynamic analysis of a stealer.',
                        video_type: 'long',
                        tags: ['reversing', 'malware'],
                        external_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
                        storage_path: null,
                        thumbnail_url: 'https://images.unsplash.com/photo-1563206767-5b18f218e8de',
                        duration_sec: 1820,
                        views: 342,
                        likes: []
                    },
                    {
                        id: generateId(),
                        owner_id: neo.id,
                        owner_name: neo.name,
                        owner_role: 'student',
                        title: 'Quick Tip: SQLi Payload That Bypasses WAF',
                        description: '60-second trick for tough WAFs.',
                        video_type: 'short',
                        tags: ['sqli', 'waf'],
                        external_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
                        storage_path: null,
                        thumbnail_url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5',
                        duration_sec: 58,
                        views: 890,
                        likes: []
                    },
                    {
                        id: generateId(),
                        owner_id: trinity.id,
                        owner_name: trinity.name,
                        owner_role: 'researcher',
                        title: 'Zero-Day Disclosure Ethics',
                        description: 'How to responsibly disclose vulnerabilities.',
                        video_type: 'long',
                        tags: ['ethics', 'disclosure'],
                        external_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
                        storage_path: null,
                        thumbnail_url: 'https://images.unsplash.com/photo-1672872476232-da16b45c9001',
                        duration_sec: 950,
                        views: 210,
                        likes: []
                    },
                    {
                        id: generateId(),
                        owner_id: neo.id,
                        owner_name: neo.name,
                        owner_role: 'student',
                        title: 'CTF Flag Grab in 45 Seconds',
                        description: 'Fast crypto flag with a simple ROT trick.',
                        video_type: 'short',
                        tags: ['ctf', 'crypto'],
                        external_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
                        storage_path: null,
                        thumbnail_url: 'https://images.unsplash.com/photo-1620825937374-87fc7d6bddc2',
                        duration_sec: 45,
                        views: 1240,
                        likes: []
                    }
                ];

                await Video.insertMany(videos);
                logger.info(`✅ ${videos.length} videos created`);
            }
        }

        // ===== Create Hackathon =====
        const hackathonsCount = await Hackathon.countDocuments();
        if (hackathonsCount === 0) {
            const morpheus = await User.findOne({ email: 'morpheus@hacktrick.io' });
            if (morpheus) {
                const hackathon = new Hackathon({
                    id: generateId(),
                    creator_id: morpheus.id,
                    creator_name: morpheus.name,
                    title: 'HackTrick Winter Games 2026',
                    description: 'Global cybersecurity competition. Solve challenges, capture flags, climb the unified leaderboard.',
                    start_time: new Date(),
                    end_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
                    challenges: [
                        { id: generateId(), title: 'Beginner Crypto', category: 'Crypto', points: 100, prompt: "Caesar cipher shifted by 3: 'kdfnwulfn'. Decode.", flag: 'hacktrick' },
                        { id: generateId(), title: 'SQLi Playground', category: 'Web', points: 200, prompt: "Login as admin. Enter the payload for password.", flag: "' OR 1=1--" },
                        { id: generateId(), title: 'Log Forensics', category: 'Forensics', points: 150, prompt: "Attacker IP appears 42 times. What's the IP? Sample line: 'GET /admin from 192.168.1.66'", flag: '192.168.1.66' },
                        { id: generateId(), title: 'Binary Whisper', category: 'Reversing', points: 300, prompt: "Convert binary 01100110 01101100 01100001 01100111 to ASCII (lowercase).", flag: 'flag' }
                    ],
                    participants: []
                });
                await hackathon.save();
                logger.info(`✅ Hackathon created`);
            }
        }

        // Write credentials file
        const credsPath = path.join(__dirname, '../../memory');
        if (!fs.existsSync(credsPath)) {
            fs.mkdirSync(credsPath, { recursive: true });
        }

        const credsContent = `# HackTrick Test Credentials

## Admin
- Email: ${adminEmail}
- Password: ${adminPassword}
- Role: admin

## Demo Users (all password: Password@1)
- neo@hacktrick.io - Student (Neo Anderson)
- trinity@hacktrick.io - Researcher (Trinity)
- morpheus@hacktrick.io - Instructor (Morpheus)
- recruiter@corp.io - HR (Alice Recruiter)
- cipher@hacktrick.io - Student (Cipher)

## Auth Endpoints
- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/logout
- GET  /api/auth/me
`;

        fs.writeFileSync(path.join(credsPath, 'test_credentials.md'), credsContent);
        logger.info(`✅ Credentials file created`);

        logger.info('🎉 Database seeding completed successfully!');
        process.exit(0);
    } catch (error) {
        logger.error(`❌ Seeding failed: ${error.message}`);
        process.exit(1);
    }
};

/**
 * Get rank based on XP
 */
const getRank = (xp) => {
    if (xp >= 2000) return 'Elite Hacker';
    if (xp >= 1000) return 'Red Team Lead';
    if (xp >= 500) return 'Pentester';
    if (xp >= 200) return 'Script Kiddie';
    return 'Rookie';
};

// Run seeding
seedDatabase();

export default seedDatabase;