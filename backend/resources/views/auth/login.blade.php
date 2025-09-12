<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Login</title>
    <style>
        body { font-family: Arial, sans-serif; background: #f7f7f7; }
        .login-box { max-width: 400px; margin: 60px auto; background: #fff; padding: 32px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
        h2 { margin-bottom: 24px; text-align: center; }
        input { width: 100%; padding: 10px; margin-bottom: 16px; border: 1px solid #ddd; border-radius: 4px; }
        button { width: 100%; padding: 10px; background: #4f46e5; color: #fff; border: none; border-radius: 4px; font-weight: bold; }
    </style>
</head>
<body>
    <div class="login-box">
        <h2>Login</h2>
        <form method="POST" action="/auth/login">
            <input type="text" name="email" placeholder="Email" required>
            <input type="password" name="password" placeholder="Password" required>
            <button type="submit">Login</button>
        </form>
    </div>
</body>
</html>
