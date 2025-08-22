{{-- resources/views/errors/403.blade.php --}}
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Accès interdit | BTP Consulting</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: Arial, sans-serif;
            background: #f8f9fa;
            margin: 0;
            padding: 0;
            color: #333;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
        }
        .error-container {
            text-align: center;
            max-width: 600px;
            padding: 20px;
        }
        .building-illustration {
            margin-bottom: 20px;
        }
        .building-svg {
            width: 200px;
            height: 150px;
        }
        h1 {
            font-size: 6rem;
            margin: 0;
            color: #e74c3c;
        }
        h2 {
            font-size: 1.8rem;
            margin: 10px 0;
            color: #444;
        }
        p {
            font-size: 1rem;
            color: #666;
            margin-top: 10px;
        }
    </style>
</head>
<body>
    <div class="error-container">
        <div class="building-illustration">
            <svg class="building-svg" viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg">
                <!-- Building 1 -->
                <rect x="20" y="60" width="50" height="90" fill="#3498db"/>
                <rect x="25" y="70" width="8" height="8" fill="#ecf0f1"/>
                <rect x="37" y="70" width="8" height="8" fill="#ecf0f1"/>
                <rect x="57" y="70" width="8" height="8" fill="#ecf0f1"/>
                <rect x="25" y="85" width="8" height="8" fill="#ecf0f1"/>
                <rect x="37" y="85" width="8" height="8" fill="#ecf0f1"/>
                <rect x="57" y="85" width="8" height="8" fill="#ecf0f1"/>
                
                <!-- Building 2 -->
                <rect x="75" y="40" width="60" height="110" fill="#2c3e50"/>
                <rect x="85" y="50" width="10" height="10" fill="#ecf0f1"/>
                <rect x="100" y="50" width="10" height="10" fill="#ecf0f1"/>
                <rect x="115" y="50" width="10" height="10" fill="#ecf0f1"/>
                <rect x="85" y="70" width="10" height="10" fill="#ecf0f1"/>
                <rect x="100" y="70" width="10" height="10" fill="#ecf0f1"/>
                <rect x="115" y="70" width="10" height="10" fill="#ecf0f1"/>
                <rect x="85" y="90" width="10" height="10" fill="#ecf0f1"/>
                <rect x="100" y="90" width="10" height="10" fill="#ecf0f1"/>
                <rect x="115" y="90" width="10" height="10" fill="#ecf0f1"/>
                
                <!-- Building 3 -->
                <rect x="140" y="70" width="40" height="80" fill="#e74c3c"/>
                <rect x="145" y="80" width="6" height="6" fill="#ecf0f1"/>
                <rect x="155" y="80" width="6" height="6" fill="#ecf0f1"/>
                <rect x="165" y="80" width="6" height="6" fill="#ecf0f1"/>
                <rect x="145" y="95" width="6" height="6" fill="#ecf0f1"/>
                <rect x="155" y="95" width="6" height="6" fill="#ecf0f1"/>
                <rect x="165" y="95" width="6" height="6" fill="#ecf0f1"/>
            </svg>
        </div>
        <h1>403</h1>
        <h2>Accès interdit</h2>
        <p>Vous n'avez pas les permissions nécessaires pour accéder à cette ressource.<br>
        Veuillez contacter votre administrateur pour obtenir les droits d'accès appropriés.</p>
    </div>
</body>
</html>