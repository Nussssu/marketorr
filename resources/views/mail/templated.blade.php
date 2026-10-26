<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="color-scheme" content="dark" />
    <meta name="supported-color-schemes" content="dark" />
    <title>{{ $siteName }}</title>
</head>
<body style="margin:0;padding:0;background:#0b0b0f;" bgcolor="#0b0b0f">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#0b0b0f" style="background:#0b0b0f;padding:32px 16px;">
        <tr>
            <td align="center">
                <table role="presentation" width="600" cellpadding="0" cellspacing="0" bgcolor="#14141b" style="width:100%;max-width:600px;background:#14141b;border-radius:14px;overflow:hidden;">
                    <tr>
                        <td style="height:4px;line-height:4px;font-size:4px;background:#507AF4;background:linear-gradient(90deg,#891FFB,#507AF4,#1BE2EB);">&nbsp;</td>
                    </tr>
                    <tr>
                        <td align="left" style="padding:32px 32px 24px;border-bottom:1px solid #23232e;">
                            <a href="{{ $siteUrl }}" target="_blank" style="text-decoration:none;color:#ffffff;">
                                @if ($logoUrl)
                                    {{-- Embedded in the message when sending; the admin preview has no $message and links it. --}}
                                    <img
                                        src="{{ isset($message) && $logoFile ? $message->embed($logoFile) : $logoUrl }}"
                                        alt="{{ $siteName }}"
                                        width="{{ $logoWidth }}"
                                        @if ($logoHeight) height="{{ $logoHeight }}" @endif
                                        style="display:block;width:{{ $logoWidth }}px;max-width:100%;height:auto;border:0;outline:none;text-decoration:none;font-family:'Helvetica Neue',Arial,sans-serif;font-size:20px;font-weight:700;color:#ffffff;"
                                    />
                                @else
                                    <span style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:20px;font-weight:700;color:#ffffff;">{{ $siteName }}</span>
                                @endif
                            </a>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:32px 32px 16px;font-family:'Helvetica Neue',Arial,sans-serif;font-size:15px;line-height:1.7;color:#d7d7e0;">
                            {{-- The template's widgets, with placeholder values already escaped. --}}
                            {!! $bodyHtml !!}
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:18px 32px 28px;font-family:'Helvetica Neue',Arial,sans-serif;font-size:12px;line-height:1.6;color:#6c6c7d;border-top:1px solid #23232e;">
                            Sent by {{ $siteName }}@if ($contactEmail) · <a href="mailto:{{ $contactEmail }}" style="color:#9a9aab;text-decoration:underline;">{{ $contactEmail }}</a>@endif
                            <br />{{ $copyright }}
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
