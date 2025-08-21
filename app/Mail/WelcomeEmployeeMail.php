<?php

namespace App\Mail;

use App\Models\User;
use App\Models\Salarie;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class WelcomeEmployeeMail extends Mailable
{
    use Queueable, SerializesModels;

    public $user;
    public $salarie;
    public $password;

    public function __construct(User $user, Salarie $salarie, string $password)
    {
        $this->user = $user;
        $this->salarie = $salarie;
        $this->password = $password;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Welcome to BetConsulting - Account Information',
        );
    }

    public function content(): Content
    {
        return new Content(
            htmlString: $this->getEmailHtml()
        );
    }

    private function getEmailHtml(): string
    {
        $dateEmbauche = $this->salarie->date_embauche 
            ? date('F d, Y', strtotime($this->salarie->date_embauche))
            : 'Not specified';

        return "
        <!DOCTYPE html>
        <html lang='en' xmlns='http://www.w3.org/1999/xhtml' xmlns:v='urn:schemas-microsoft-com:vml' xmlns:o='urn:schemas-microsoft-com:office:office'>
        <head>
            <meta charset='UTF-8'>
            <meta name='viewport' content='width=device-width, initial-scale=1.0'>
            <meta http-equiv='X-UA-Compatible' content='IE=edge'>
            <meta name='x-apple-disable-message-reformatting'>
            <title>Welcome to BetConsulting</title>
            <!--[if mso]>
            <xml>
                <o:OfficeDocumentSettings>
                    <o:AllowPNG/>
                    <o:PixelsPerInch>96</o:PixelsPerInch>
                </o:OfficeDocumentSettings>
            </xml>
            <![endif]-->
            <style>
                /* Reset */
                body, table, td, p, a, li, blockquote {
                    -webkit-text-size-adjust: 100%;
                    -ms-text-size-adjust: 100%;
                }
                table, td {
                    mso-table-lspace: 0pt;
                    mso-table-rspace: 0pt;
                }
                img {
                    -ms-interpolation-mode: bicubic;
                    border: 0;
                    height: auto;
                    line-height: 100%;
                    outline: none;
                    text-decoration: none;
                }

                /* Base Styles */
                body {
                    margin: 0 !important;
                    padding: 0 !important;
                    background-color: #f4f4f4 !important;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif !important;
                }

                /* Container */
                .email-container {
                    max-width: 600px;
                    margin: 0 auto;
                    background-color: #ffffff;
                }

                /* Header */
                .header {
                    background-color: #2c3e50;
                    padding: 40px 30px;
                    text-align: center;
                }
                .header h1 {
                    color: #ffffff;
                    font-size: 24px;
                    font-weight: 600;
                    margin: 0;
                    line-height: 1.3;
                }

                /* Content */
                .content {
                    padding: 40px 30px;
                    line-height: 1.6;
                    color: #333333;
                }
                .greeting {
                    font-size: 18px;
                    margin-bottom: 20px;
                    color: #2c3e50;
                }
                .text {
                    font-size: 16px;
                    margin-bottom: 20px;
                    color: #555555;
                }

                /* Info Section */
                .info-section {
                    background-color: #f8f9fa;
                    border: 1px solid #e9ecef;
                    border-radius: 6px;
                    padding: 25px;
                    margin: 25px 0;
                }
                .info-title {
                    font-size: 16px;
                    font-weight: 600;
                    color: #2c3e50;
                    margin: 0 0 20px 0;
                }
                .info-row {
                    margin-bottom: 12px;
                }
                .info-label {
                    display: inline-block;
                    font-weight: 600;
                    color: #666666;
                    width: 120px;
                    vertical-align: top;
                }
                .info-value {
                    color: #333333;
                }

                /* Credentials Box */
                .credentials {
                    background-color: #f0f8ff;
                    border: 2px solid #3498db;
                    border-radius: 6px;
                    padding: 25px;
                    margin: 25px 0;
                }
                .credentials-title {
                    font-size: 16px;
                    font-weight: 600;
                    color: #2c3e50;
                    margin: 0 0 20px 0;
                }
                .credential-row {
                    margin-bottom: 15px;
                }
                .credential-label {
                    display: block;
                    font-weight: 600;
                    color: #666666;
                    margin-bottom: 5px;
                }
                .credential-value {
                    background-color: #ffffff;
                    padding: 12px 15px;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                    font-family: 'Courier New', monospace;
                    font-size: 14px;
                    color: #333333;
                    word-break: break-all;
                }

                /* Security Notice */
                .security-notice {
                    background-color: #fff3cd;
                    border: 1px solid #ffeaa7;
                    border-radius: 6px;
                    padding: 20px;
                    margin: 25px 0;
                }
                .security-title {
                    font-weight: 600;
                    color: #856404;
                    margin: 0 0 10px 0;
                }
                .security-text {
                    color: #856404;
                    font-size: 14px;
                    margin: 0;
                }

                /* Button */
                .button-container {
                    text-align: center;
                    margin: 30px 0;
                }
                .button {
                    display: inline-block;
                    background-color: #3498db;
                    color: #ffffff !important;
                    text-decoration: none;
                    padding: 15px 30px;
                    border-radius: 6px;
                    font-weight: 600;
                    font-size: 16px;
                    transition: background-color 0.3s ease;
                }

                /* Footer */
                .footer {
                    background-color: #f8f9fa;
                    padding: 30px;
                    text-align: center;
                    border-top: 1px solid #e9ecef;
                }
                .footer-text {
                    color: #6c757d;
                    font-size: 14px;
                    margin: 0 0 10px 0;
                    line-height: 1.5;
                }
                .footer-copyright {
                    color: #8e9296;
                    font-size: 12px;
                    margin: 10px 0 0 0;
                }

                /* Mobile Responsive */
                @media only screen and (max-width: 600px) {
                    .email-container {
                        width: 100% !important;
                        max-width: 100% !important;
                    }
                    .content,
                    .header,
                    .footer {
                        padding: 25px 20px !important;
                    }
                    .info-section,
                    .credentials,
                    .security-notice {
                        padding: 20px !important;
                        margin: 20px 0 !important;
                    }
                    .info-label {
                        width: 100px !important;
                        display: block !important;
                        margin-bottom: 5px !important;
                    }
                    .button {
                        padding: 12px 25px !important;
                        font-size: 14px !important;
                    }
                }

                /* Dark Mode Support */
                @media (prefers-color-scheme: dark) {
                    .email-container {
                        background-color: #ffffff !important;
                    }
                }
            </style>
        </head>
        <body>
            <center style='width: 100%; background-color: #f4f4f4;'>
                <div class='email-container'>
                    <!-- Header -->
                    <div class='header'>
                        <h1>Welcome to BetConsulting</h1>
                    </div>
                    
                    <!-- Content -->
                    <div class='content'>
                        <div class='greeting'>
                            Dear {$this->salarie->prenom} {$this->salarie->nom},
                        </div>
                        
                        <div class='text'>
                            Welcome to BetConsulting! We are pleased to have you join our team. Your system access account has been successfully created.
                        </div>
                        
                        <!-- Employee Information -->
                        <div class='info-section'>
                            <div class='info-title'>Employee Information</div>
                            <div class='info-row'>
                                <span class='info-label'>Full Name:</span>
                                <span class='info-value'>{$this->user->name}</span>
                            </div>
                            " . ($this->salarie->poste ? "
                            <div class='info-row'>
                                <span class='info-label'>Position:</span>
                                <span class='info-value'>{$this->salarie->poste}</span>
                            </div>
                            " : "") . "
                            <div class='info-row'>
                                <span class='info-label'>Start Date:</span>
                                <span class='info-value'>{$dateEmbauche}</span>
                            </div>
                        </div>
                        
                        <!-- Login Credentials -->
                        <div class='credentials'>
                            <div class='credentials-title'>Your Login Credentials</div>
                            <div class='credential-row'>
                                <div class='credential-label'>Email Address:</div>
                                <div class='credential-value'>{$this->user->email}</div>
                            </div>
                            <div class='credential-row'>
                                <div class='credential-label'>Password:</div>
                                <div class='credential-value'>{$this->password}</div>
                            </div>
                        </div>
                        
                        <!-- Security Notice -->
                        <div class='security-notice'>
                            <div class='security-title'>Security Reminder</div>
                            <div class='security-text'>
                                Please keep your login credentials confidential and do not share them with anyone. We recommend changing your password after your first login.
                            </div>
                        </div>
                        
                        <!-- Login Button -->
                        <div class='button-container'>
                            <a href='" . config('app.url') . "' class='button'>
                                Access System
                            </a>
                        </div>
                        
                        <div class='text'>
                            If you have any questions or need assistance, please don't hesitate to contact our support team.
                        </div>
                    </div>
                    
                    <!-- Footer -->
                    <div class='footer'>
                        <div class='footer-text'>
                            This email was sent automatically by BetConsulting's management system.<br>
                            Please do not reply to this email.
                        </div>
                        <div class='footer-copyright'>
                            © " . date('Y') . " BetConsulting. All rights reserved.
                        </div>
                    </div>
                </div>
            </center>
        </body>
        </html>";
    }

    public function attachments(): array
    {
        return [];
    }
}