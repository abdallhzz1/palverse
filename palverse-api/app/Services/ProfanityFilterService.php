<?php

namespace App\Services;

class ProfanityFilterService
{
    /**
     * A simple list of offensive or banned words.
     * In a real production app, this list should be comprehensive or loaded from a database/external API.
     */
    protected array $badWords = [
        // English
        'fuck', 'shit', 'bitch', 'asshole', 'cunt', 'dick', 'pussy', 'bastard', 'slut', 'whore',
        'motherfucker', 'cocksucker', 'nigger', 'faggot', 'retard', 'twat', 'wanker', 'prick', 'douche',
        'bullshit', 'horseshit', 'dumbass', 'jackass', 'scum', 'whitetrash', 'skank', 'slutty', 'fucking',

        // Arabic
        'كلب', 'حمار', 'حيوان', 'زبالة', 'حقير', 'تيس', 'قواد', 'عرص', 'شرموطة', 'كلبة', 'نصاب', 'حرامي',
        'قحبة', 'منيوك', 'شرموط', 'عرصا', 'كسمك', 'خول', 'شاذ', 'ديوث', 'خنزير', 'تافه', 'واطي', 'سافل',
        'زق', 'وسخ', 'عاهرة', 'مومس', 'متخلف', 'غبي', 'أهبل', 'منحط', 'سرسري', 'داشر', 'صايع', 'ضايع',
        'سراق', 'كذاب', 'منافق', 'نوريه', 'لوطي', 'مخنث', 'ابن الكلب', 'ابن الحرام', 'بنت الحرام', 'زفت'
    ];

    /**
     * Check if the given text contains any profanity.
     *
     * @param string|null $text
     * @return bool True if the text is clean, false if it contains bad words.
     */
    public function isClean(?string $text): bool
    {
        if (empty($text)) {
            return true;
        }

        // Convert to lowercase for English matching
        $normalizedText = mb_strtolower($text);

        foreach ($this->badWords as $word) {
            $normalizedWord = mb_strtolower($word);
            
            // Using str_contains for basic matching.
            if (str_contains($normalizedText, $normalizedWord)) {
                return false;
            }
        }

        return true;
    }
}
