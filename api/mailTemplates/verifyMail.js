// verifyMailTemplate.js

const verifyMailTemplate = (OTP) => {
    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background: linear-gradient(45deg, #06dcd4 25%, #19b9d4 77%);
                    margin: 0;
                    padding: 0;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 100vh;
                }
                .container {
                    background: linear-gradient(45deg, #06dcd4 25%, #19b9d4 77%);
                    padding: 20px;
                    border-radius: 10px;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                    text-align: center;
                    max-width: 400px;
                    position: relative;
                }
                h1 {
                    color: #333;
                    font-size: 28px;
                    margin-bottom: 20px;
                }
                p {
                    color: #fff;
                    font-size: 18px;
                    margin-bottom: 20px;
                }
                .otp {
                    font-size: 32px;
                    font-weight: bold;
                    color: #28a745;
                    background-color: #ffffff;
                    padding: 10px;
                    border-radius: 5px;
                    display: inline-block;
                    margin-bottom: 20px;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                }
                .logo {
                    max-width: 100px;
                    margin-bottom: 20px;
                    border-radius: 10px;
                    background: #ffffff;
                    padding: 5px;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <img src="https://kifaytidata2024.s3.ap-south-1.amazonaws.com/kifayti_logo.png" alt="Kifayti Health Logo" class="logo">
                <h1>Email Verification</h1>
                <p>Please use the following OTP to verify your email:</p>
                <div class="otp">${OTP}</div>
            </div>
        </body>
        </html>
    `;
};

module.exports = verifyMailTemplate;
