<?php
// السماح بالوصول من أي مصدر (أو حدده بنطاقك)
header("Access-Control-Allow-Origin: *");
header("Content-Type: text/plain; charset=utf-8");

// جلب الرابط من المعامل ?url=
if (!isset($_GET['url']) || empty($_GET['url'])) {
    http_response_code(400);
    echo "Missing url parameter";
    exit;
}

$url = $_GET['url'];

// التحقق من أن الرابط يبدأ بـ http أو https (اختياري)
if (!preg_match('/^https?:\/\//i', $url)) {
    http_response_code(400);
    echo "Invalid URL";
    exit;
}

// استخدام cURL إذا كان متاحاً
if (function_exists('curl_init')) {
    $ch = curl_init();
    curl_setopt_array($ch, [
        CURLOPT_URL => $url,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_TIMEOUT => 20,
        CURLOPT_USERAGENT => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        CURLOPT_SSL_VERIFYPEER => false, // قد تحتاج تعطيل التحقق إذا كان الرابط HTTP
    ]);
    $content = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($content === false || $httpCode != 200) {
        http_response_code(500);
        echo "Failed to fetch M3U: HTTP $httpCode";
        exit;
    }
    echo $content;
    exit;
}

// بديل: استخدام file_get_contents إذا كان allow_url_fopen مفعلاً
$content = @file_get_contents($url);
if ($content === false) {
    http_response_code(500);
    echo "Failed to fetch M3U";
    exit;
}
echo $content;
?>
