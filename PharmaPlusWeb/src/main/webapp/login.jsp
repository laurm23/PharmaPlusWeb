<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pharma Plus - Iniciar Sesion</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: Arial, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        .login-container {
            background: white;
            border-radius: 16px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            width: 100%;
            max-width: 420px;
            padding: 40px;
        }
        .logo-container {
            text-align: center;
            margin-bottom: 20px;
        }
        .logo-container h1 {
            color: #667eea;
            font-size: 32px;
            margin: 0;
        }
        .saludo h2 {
            font-size: 24px;
            font-weight: 700;
            text-align: center;
            color: #333;
            margin-bottom: 8px;
        }
        .saludo h4 {
            font-size: 14px;
            font-weight: 400;
            text-align: center;
            color: #666;
            margin-bottom: 30px;
        }
        .form-grupo {
            margin-bottom: 20px;
        }
        .form-grupo label {
            display: block;
            font-size: 13px;
            font-weight: 600;
            color: #333;
            margin-bottom: 8px;
        }
        .form-grupo input {
            width: 100%;
            padding: 12px;
            font-size: 14px;
            border: 1px solid #ddd;
            border-radius: 8px;
        }
        .form-grupo input:focus {
            outline: none;
            border-color: #667eea;
        }
        .btn-login {
            width: 100%;
            padding: 14px;
            background: #667eea;
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 15px;
            font-weight: 600;
            cursor: pointer;
        }
        .btn-login:hover {
            background: #5568d3;
        }
        .mensaje-error {
            background: #fee;
            color: #c33;
            padding: 12px;
            border-radius: 8px;
            margin-bottom: 20px;
            text-align: center;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="login-container">
        <div class="logo-container">
    <img src="<%= request.getContextPath() %>/images/logo.png" 
         alt="Pharma Plus" 
         style="width: 120px; height: auto; margin-bottom: 10px;"
         onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
    <h1 style="display: none;">Pharma Plus</h1>
</div>

        <div class="saludo">
            <%
                java.time.LocalTime hora = java.time.LocalTime.now();
                String saludo;
                if (hora.getHour() >= 6 && hora.getHour() < 12) {
                    saludo = "Buenos dias";
                } else if (hora.getHour() >= 12 && hora.getHour() < 19) {
                    saludo = "Buenas tardes";
                } else {
                    saludo = "Buenas noches";
                }
            %>
            <h2><%= saludo %>!</h2>
            <h4>Ingresa tus datos para acceder</h4>
        </div>

        <% if (request.getAttribute("error") != null) { %>
            <div class="mensaje-error">
                <%= request.getAttribute("error") %>
            </div>
        <% } %>

        <form method="POST" action="<%= request.getContextPath() %>/login">
            <div class="form-grupo">
                <label for="email">Email</label>
                <input type="email" id="email" name="email" placeholder="correo@ejemplo.com" required>
            </div>

            <div class="form-grupo">
                <label for="contrasena">Contrasena</label>
                <input type="password" id="contrasena" name="contrasena" placeholder="********" required>
            </div>

            <button type="submit" class="btn-login">Iniciar Sesion</button>
        </form>
    </div>
</body>
</html>