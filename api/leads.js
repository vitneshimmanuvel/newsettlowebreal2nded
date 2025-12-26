const nodemailer = require('nodemailer');

// Email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// In-memory storage (for demo - you can connect to database later)
const leads = [];

// Send email notification
async function sendEmailNotification(leadData) {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; background: #f5f5f5; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #ff6b35, #ff8c42); color: white; padding: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; }
        .content { padding: 30px; }
        .field { margin-bottom: 20px; padding: 15px; background: #f8fafc; border-radius: 8px; border-left: 4px solid #ff6b35; }
        .field label { font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 1px; }
        .field p { margin: 5px 0 0; font-size: 16px; color: #1e293b; font-weight: 500; }
        .footer { background: #f8fafc; padding: 20px; text-align: center; color: #64748b; font-size: 12px; }
        .badge { display: inline-block; background: #ff6b35; color: white; padding: 5px 12px; border-radius: 20px; font-size: 12px; margin-top: 10px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎯 New Lead from Settlo</h1>
          <span class="badge">${leadData.source === 'contact' ? 'Contact Form' : 'Demo Request'}</span>
        </div>
        <div class="content">
          <div class="field">
            <label>Name</label>
            <p>${leadData.name}</p>
          </div>
          <div class="field">
            <label>Email</label>
            <p><a href="mailto:${leadData.email}">${leadData.email}</a></p>
          </div>
          <div class="field">
            <label>Phone</label>
            <p><a href="tel:${leadData.phone}">${leadData.phone}</a></p>
          </div>
          ${leadData.company ? `
          <div class="field">
            <label>Company</label>
            <p>${leadData.company}</p>
          </div>
          ` : ''}
          ${leadData.demo ? `
          <div class="field">
            <label>Demo Requested</label>
            <p>${leadData.demo}</p>
          </div>
          ` : ''}
          ${leadData.message ? `
          <div class="field">
            <label>Message</label>
            <p>${leadData.message}</p>
          </div>
          ` : ''}
          <div class="field">
            <label>Submitted</label>
            <p>${new Date().toLocaleString()}</p>
          </div>
        </div>
        <div class="footer">
          © ${new Date().getFullYear()} Settlo. All rights reserved.
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: `"Settlo Leads" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_TO,
      subject: `${leadData.source === 'contact' ? 'Contact Form' : 'Demo Request'} - ${leadData.name}`,
      html: htmlContent
    });
    console.log('✅ Email sent successfully');
    return true;
  } catch (error) {
    console.error('❌ Email failed:', error.message);
    return false;
  }
}

// CORS headers
function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
}

// Health check
export default async function handler(req, res) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Health check endpoint
  if (req.url === '/api/health' || req.url === '/' || req.url === '') {
    return res.status(200).json({ 
      status: 'ok', 
      message: 'Settlo Backend v2 is running!' 
    });
  }

  // Leads endpoint
  if (req.url === '/api/leads') {
    if (req.method === 'POST') {
      try {
        const { name, email, phone, company, message, demo, source } = req.body;

        // Validation
        if (!name || !email || !phone || !source) {
          return res.status(400).json({ 
            success: false, 
            error: 'Missing required fields: name, email, phone, source' 
          });
        }

        // Create lead object
        const lead = {
          id: Date.now(),
          name,
          email,
          phone,
          company: company || null,
          message: message || null,
          demo: demo || null,
          source,
          createdAt: new Date().toISOString()
        };

        // Store lead
        leads.push(lead);
        console.log(`✅ New lead saved: ${lead.name}`);

        // Send email (non-blocking)
        sendEmailNotification(lead).catch(err => {
          console.error('Email notification failed:', err);
        });

        return res.status(201).json({
          success: true,
          message: 'Lead submitted successfully!',
          lead: {
            id: lead.id,
            name: lead.name,
            createdAt: lead.createdAt
          }
        });

      } catch (error) {
        console.error('❌ Error:', error);
        return res.status(500).json({
          success: false,
          error: error.message || 'Failed to submit lead'
        });
      }
    }

    if (req.method === 'GET') {
      return res.status(200).json({
        success: true,
        count: leads.length,
        leads: leads
      });
    }
  }

  return res.status(404).json({ error: 'Not found' });
}
