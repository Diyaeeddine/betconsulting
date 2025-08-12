<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>404 - Page Not Found</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: Arial, sans-serif;
            background-color: #2563eb;
            color: white;
            height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .error-container {
            text-align: center;
            max-width: 500px;
            padding: 2rem;
        }

        .error-number {
            font-size: 6rem;
            font-weight: bold;
            color: #f97316;
            margin-bottom: 1rem;
        }

        .error-title {
            font-size: 2rem;
            margin-bottom: 1rem;
            font-weight: normal;
        }

        .error-message {
            font-size: 1.1rem;
            margin-bottom: 2rem;
            line-height: 1.5;
        }

        .btn-container {
            display: flex;
            gap: 1rem;
            justify-content: center;
        }

        .btn {
            padding: 12px 24px;
            border: none;
            border-radius: 5px;
            font-size: 1rem;
            cursor: pointer;
            text-decoration: none;
            display: inline-block;
        }

        .btn-primary {
            background-color: #f97316;
            color: white;
        }

        .btn-primary:hover {
            background-color: #ea580c;
        }

        .btn-secondary {
            background-color: transparent;
            color: white;
            border: 2px solid white;
        }

        .btn-secondary:hover {
            background-color: white;
            color: #2563eb;
        }

        @media (max-width: 600px) {
            .error-number {
                font-size: 4rem;
            }
            
            .error-title {
                font-size: 1.5rem;
            }
            
            .btn-container {
                flex-direction: column;
                align-items: center;
            }
            
            .btn {
                width: 200px;
            }
        }
    </style>
</head>
<body>
<div class="error-container">
    <div class="error-number">404</div>
    <h1 class="error-title">Page introuvable</h1>
    <p class="error-message">
        La page que vous recherchez est introuvable.
    </p>
    <div class="btn-container">
        <a href="/" class="btn btn-primary">Aller à l'accueil</a>
        <a href="javascript:history.back()" class="btn btn-secondary">Retour</a>
    </div>
</div>

</body>
</html>