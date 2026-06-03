<?php

require_once 'env.php';

//loadEnv(__DIR__ . '/.env');
loadEnv(__DIR__ . '/../.env');

// Server Key Midtrans kamu
$serverKey = $_ENV['MIDTRANS_SERVER_KEY_SANDBOX']; // Your server key (Sandbox)

// Generate Basic Auth: base64(ServerKey + ":")
$auth = base64_encode($serverKey . ":");

$url = "https://app.sandbox.midtrans.com/snap/v1/transactions"; // Sandbox
//$url = "https://app.midtrans.com/snap/v1/transactions"; // Production

$payload = [
    "transaction_details" => [
        "order_id" => rand(),
        "gross_amount" => $_POST["total"],
    ],
    /*"credit_card" => [
        "secure" => true
    ],*/
    'item_details' => json_decode($_POST['items'], true),
    "customer_details" => [
        "first_name" => $_POST["name"],
        //"last_name" => $_POST["name"],
        "email" => $_POST["email"],
        "phone" => $_POST["phone"],
    ]
];

$ch = curl_init();

curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Accept: application/json",
    "Content-Type: application/json",
    "Authorization: Basic " . $auth
]);

curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));

$response = curl_exec($ch);
$result = json_decode($response, true);
$token = $result["token"] ?? null;

if (curl_errno($ch)) {
    echo "Error: " . curl_error($ch);
} else {
    echo $token;
}

curl_close($ch);
?>