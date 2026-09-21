<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{{ $siteName }}</title>
</head>
<body style="margin:0;padding:0;background:#0b0b0f;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0b0b0f;padding:32px 16px;">
        <tr>
            <td align="center">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#14141b;border-radius:14px;overflow:hidden;">
                    <tr>
                        <td style="height:4px;background:linear-gradient(90deg,#891FFB,#507AF4,#1BE2EB);">&nbsp;</td>
                    </tr>
                    <tr>
                        <td style="padding:32px 32px 8px;font-family:'Helvetica Neue',Arial,sans-serif;">
                            <p style="margin:0;font-size:12px;letter-spacing:.18em;text-transform:uppercase;font-weight:700;color:#8b8b9a;">{{ $siteName }}</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:8px 32px 32px;font-family:'Helvetica Neue',Arial,sans-serif;font-size:15px;line-height:1.7;color:#d7d7e0;">
                            {{-- The editor's HTML, with placeholder values already escaped. --}}
                            {!! $bodyHtml !!}
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:0 32px 28px;font-family:'Helvetica Neue',Arial,sans-serif;font-size:12px;color:#6c6c7d;border-top:1px solid #23232e;padding-top:18px;">
                            Sent by {{ $siteName }}.
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
