<?php

namespace App\Enums;

enum SocialPlatform: string
{
    case FACEBOOK = 'facebook';
    case INSTAGRAM = 'instagram';
    case TIKTOK = 'tiktok';
    case LINKEDIN = 'linkedin';
    case YOUTUBE = 'youtube';
    case X = 'x';
    case TELEGRAM = 'telegram';
    case SNAPCHAT = 'snapchat';
    case OTHER = 'other';
}
