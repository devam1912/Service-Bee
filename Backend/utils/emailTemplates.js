export const getOtpTemplate = (otp, name = "there", type = "Login Verification") => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Service Bee - OTP Verification</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background-color: #f9fafb;
                margin: 0;
                padding: 0;
                color: #374151;
            }
            .container {
                max-width: 600px;
                margin: 40px auto;
                background-color: #ffffff;
                border-radius: 24px;
                overflow: hidden;
                box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
            }
            .header {
                background-color: #fbbf24;
                padding: 40px 20px;
                text-align: center;
            }
            .logo {
                font-size: 32px;
                font-weight: 800;
                color: #ffffff;
                text-transform: uppercase;
                letter-spacing: 2px;
                margin: 0;
            }
            .content {
                padding: 40px 30px;
                text-align: center;
            }
            .greeting {
                font-size: 24px;
                font-weight: 700;
                margin-bottom: 10px;
                color: #111827;
            }
            .description {
                font-size: 16px;
                line-height: 1.6;
                color: #6b7280;
                margin-bottom: 30px;
            }
            .otp-container {
                background-color: #fffbeb;
                border: 2px dashed #fbbf24;
                border-radius: 16px;
                padding: 20px;
                margin: 20px 0;
                display: inline-block;
            }
            .otp-code {
                font-size: 48px;
                font-weight: 900;
                color: #d97706;
                letter-spacing: 12px;
                margin-left: 12px;
            }
            .footer {
                padding: 20px;
                background-color: #f3f4f6;
                text-align: center;
                font-size: 12px;
                color: #9ca3af;
            }
            .warning {
                font-size: 14px;
                color: #9ca3af;
                margin-top: 20px;
            }
            .bee-icon {
                font-size: 40px;
                margin-bottom: 10px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">🐝 Service Bee</div>
            </div>
            <div class="content">
                <div class="bee-icon">🍯</div>
                <h1 class="greeting">Hey ${name.split(' ')[0]}!</h1>
                <p class="description">Your buzz is almost ready! Use the verification code below to complete your ${type}. This code will expire in 10 minutes.</p>
                
                <div class="otp-container">
                    <span class="otp-code">${otp}</span>
                </div>
                
                <p class="warning">If you didn't request this code, you can safely ignore this email.</p>
            </div>
            <div class="footer">
                &copy; 2026 Service Bee. All rights reserved.<br>
                Empowering the hive, one service at a time.
            </div>
        </div>
    </body>
    </html>
    `;
};

export const getWelcomeTemplate = (name, type = "User") => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body { font-family: sans-serif; background: #fffcf0; color: #444; padding: 20px; text-align: center; }
            .card { background: white; border-radius: 20px; padding: 40px; box-shadow: 0 10px 20px rgba(0,0,0,0.05); }
            h1 { color: #d97706; }
            .btn { background: #fbbf24; color: white; padding: 15px 30px; border-radius: 50px; text-decoration: none; font-weight: bold; }
        </style>
    </head>
    <body>
        <div class="card">
            <h1>Welcome to the Hive, ${name}!</h1>
            <p>We're thrilled to have you as a ${type} in the Service Bee community.</p>
            <p>Start exploring services or manage your business with ease.</p>
            <br><br>
            <a href="https://service-bee-frontend.onrender.com" class="btn">Enter the Hive</a>
        </div>
    </body>
    </html>
    `;
};
