<?php

namespace App\Services;

use App\Models\Store;
use chillerlan\QRCode\QRCode;
use chillerlan\QRCode\QROptions;
use DomainException;
use InvalidArgumentException;

class StoreQrCodeService
{
    private StoreLinkService $linkService;

    public function __construct(StoreLinkService $linkService)
    {
        $this->linkService = $linkService;
    }

    /**
     * Generate dynamic QR code encoding the canonical public store web URL.
     *
     * @throws DomainException
     * @throws InvalidArgumentException
     */
    public function generate(Store $store, ?int $size = null, ?string $format = null): string
    {
        if (empty($store->slug)) {
            throw new DomainException('STORE_SLUG_NOT_AVAILABLE');
        }

        $url = $this->linkService->generateWebUrl($store);

        $defaultSize = config('palverse.qr.default_size', 512);
        $minSize = config('palverse.qr.min_size', 128);
        $maxSize = config('palverse.qr.max_size', 1024);
        $size = $size ?? $defaultSize;

        if ($size < $minSize || $size > $maxSize) {
            throw new InvalidArgumentException("QR size must be between {$minSize} and {$maxSize}.");
        }

        $format = strtolower($format ?? config('palverse.qr.default_format', 'svg'));
        if (! in_array($format, ['svg', 'png'])) {
            throw new InvalidArgumentException("Unsupported QR format: {$format}.");
        }

        $optionsArray = [
            'version' => 5,
            'eccLevel' => 'L',
            'outputBase64' => false,
        ];

        // Detect php-qrcode library version to ensure compatibility
        if (class_exists('\\chillerlan\\QRCode\\Output\\QRMarkupSVG')) {
            // Version 6.0+ FQCN approach
            if ($format === 'png') {
                $optionsArray['outputInterface'] = '\\chillerlan\\QRCode\\Output\\QRGdImagePNG';
            } else {
                $optionsArray['outputInterface'] = '\\chillerlan\\QRCode\\Output\\QRMarkupSVG';
            }
        } else {
            // Version 5.x and below outputType approach
            if ($format === 'png') {
                // If using GD constant
                $optionsArray['outputType'] = QRCode::OUTPUT_IMAGE_PNG;
            } else {
                // MARKUP_SVG is outputType 2, but we can use constants from QROutputInterface or string
                $optionsArray['outputType'] = QRCode::OUTPUT_MARKUP_SVG;
            }
        }

        // Calculate module scale to approximate the requested pixel size
        $optionsArray['scale'] = (int) max(1, $size / 45);

        $options = new QROptions($optionsArray);
        $qrcode = new QRCode($options);

        return $qrcode->render($url);
    }
}
