// One-off script to create the first admin account plus a handful of
// sample leads, so the dashboard isn't empty on the first run.
//
// Usage:  npm run seed
const dotenv = require('dotenv');
dotenv.config();

const connectDB = require('./config/db');
const User = require('./models/User');
const Lead = require('./models/Lead');
const Note = require('./models/Note');
const Activity = require('./models/Activity');

const ADMIN_NAME = process.env.ADMIN_NAME || 'Admin User';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

const sampleLeads = [
  {
    firstName: 'Priya',
    lastName: 'Nair',
    email: 'priya.nair@example.com',
    phone: '9876543210',
    company: 'Nair Interiors',
    message: 'Interested in a website redesign quote.',
    source: 'Website',
    status: 'New'
  },
  {
    firstName: 'Daniel',
    lastName: 'Okafor',
    email: 'daniel.okafor@example.com',
    phone: '9876501234',
    company: 'Okafor Logistics',
    message: 'Asked about monthly retainer pricing.',
    source: 'LinkedIn',
    status: 'Contacted'
  },
  {
    firstName: 'Mei',
    lastName: 'Chen',
    email: 'mei.chen@example.com',
    phone: '9812345678',
    company: 'Chen & Co',
    message: 'Wants a demo of the CRM before signing.',
    source: 'Referral',
    status: 'Qualified'
  },
  {
    firstName: 'Carlos',
    lastName: 'Mendez',
    email: 'carlos.mendez@example.com',
    phone: '9800011122',
    company: '',
    message: 'Filled the contact form asking about pricing tiers.',
    source: 'Google Ads',
    status: 'Converted'
  },
  {
    firstName: 'Sarah',
    lastName: 'Miles',
    email: 'sarah.miles@example.com',
    phone: '9822233344',
    company: 'Miles Consulting',
    message: 'Went quiet after the first call.',
    source: 'Cold Email',
    status: 'Lost'
  }
];

const run = async () => {
  await connectDB();

  let admin = await User.findOne({ email: ADMIN_EMAIL });
  if (!admin) {
    admin = await User.create({
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      role: 'admin'
    });
    console.log(`Created admin user: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
  } else {
    console.log(`Admin user already exists: ${ADMIN_EMAIL}`);
  }

  const existingLeads = await Lead.countDocuments();
  if (existingLeads === 0) {
    const created = await Lead.insertMany(sampleLeads);
    for (const lead of created) {
      await Activity.create({
        leadId: lead._id,
        user: admin._id,
        action: 'created',
        newValue: { status: lead.status }
      });
    }
    await Note.create({
      leadId: created[1]._id,
      author: admin._id,
      note: 'Called on Tuesday, follow up next week about the retainer.'
    });
    console.log(`Seeded ${created.length} sample leads.`);
  } else {
    console.log(`Skipping lead seed, ${existingLeads} leads already exist.`);
  }

  console.log('Seed complete.');
  process.exit(0);
};

run().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
