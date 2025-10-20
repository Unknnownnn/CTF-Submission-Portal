#!/usr/bin/env node

/**
 * Debug Script - Check database configuration and data
 * Run: node debug.js
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkDatabase() {
  try {
    console.log('🔍 CTF Collection - Database Debug Check\n');
    
    // Connection config
    const config = {
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'ctf_collection',
    };

    console.log('📋 Configuration:');
    console.log(`  Host: ${config.host}`);
    console.log(`  User: ${config.user}`);
    console.log(`  Database: ${config.database}\n`);

    // Connect to database
    const connection = await mysql.createConnection(config);
    console.log('✅ Connected to database\n');

    // Check users table
    console.log('👥 Users in Database:');
    const [users] = await connection.execute(
      'SELECT id, name, email, is_admin, created_at FROM users'
    );
    
    if (users.length === 0) {
      console.log('  ❌ No users found!');
    } else {
      users.forEach((user, idx) => {
        console.log(`\n  ${idx + 1}. ID: ${user.id}`);
        console.log(`     Name: ${user.name || '❌ MISSING'}`);
        console.log(`     Email: ${user.email}`);
        console.log(`     Admin: ${user.is_admin ? '✅ Yes' : 'No'}`);
        console.log(`     Created: ${user.created_at}`);
      });
    }

    console.log('\n\n📤 Submissions in Database:');
    const [submissions] = await connection.execute(
      `SELECT s.id, s.title, s.user_id, u.name, u.email, s.file_path, s.external_link, s.created_at 
       FROM submissions s 
       JOIN users u ON s.user_id = u.id 
       ORDER BY s.created_at DESC`
    );

    if (submissions.length === 0) {
      console.log('  ❌ No submissions found!');
    } else {
      submissions.forEach((sub, idx) => {
        console.log(`\n  ${idx + 1}. ID: ${sub.id}`);
        console.log(`     Title: ${sub.title}`);
        console.log(`     Submitter: ${sub.name || '❌ MISSING'} (${sub.email})`);
        console.log(`     Has File: ${sub.file_path ? '✅ Yes' : 'No'}`);
        console.log(`     Has Link: ${sub.external_link ? '✅ Yes' : 'No'}`);
        console.log(`     Created: ${sub.created_at}`);
      });
    }

    // Test download filename
    if (submissions.length > 0) {
      console.log('\n\n🔗 Expected Download Filenames:');
      submissions.forEach((sub) => {
        const userName = (sub.name || 'unknown').replace(/[^a-zA-Z0-9]/g, '_');
        const zipName = `submission_${sub.id}_${userName}.zip`;
        console.log(`  Submission ${sub.id}: ${zipName}`);
      });
    }

    // Check submissions directory
    const fs = require('fs');
    const path = require('path');
    const submissionsPath = path.join(__dirname, '..', process.env.SUBMISSIONS_PATH || 'submissions');
    
    console.log('\n\n📁 Submissions Directory Check:');
    console.log(`  Path: ${submissionsPath}`);
    
    if (fs.existsSync(submissionsPath)) {
      const dirs = fs.readdirSync(submissionsPath);
      console.log(`  ✅ Directory exists with ${dirs.length} submission folder(s)`);
      
      if (dirs.length > 0 && dirs.length <= 5) {
        dirs.forEach(dir => {
          const dirPath = path.join(submissionsPath, dir);
          const files = fs.readdirSync(dirPath);
          console.log(`    - ${dir}/: ${files.join(', ')}`);
        });
      }
    } else {
      console.log(`  ❌ Directory does not exist!`);
    }

    await connection.end();
    console.log('\n\n✅ Debug check complete!\n');

  } catch (error) {
    console.error('❌ Error during debug check:', error.message);
    process.exit(1);
  }
}

checkDatabase();
