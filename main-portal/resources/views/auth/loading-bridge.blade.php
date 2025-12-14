<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SSO Loading - LSP Gatensi</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
            animation: spin 2s linear infinite;
        }
        .fade-in {
            animation: fadeIn 0.5s ease-in;
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
    </style>
</head>
<body class="bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
    <div class="flex items-center justify-center min-h-screen">
        <div class="bg-white rounded-2xl shadow-xl p-12 max-w-md w-full mx-4 fade-in">
            <!-- Logo/Icon Section -->
            <div class="flex justify-center mb-8">
                <div class="relative">
                    <div class="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center">
                        <svg class="w-10 h-10 text-indigo-600 animate-spin-slow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </div>
                    <div class="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full border-4 border-white"></div>
                </div>
            </div>

            <!-- Text Section -->
            <div class="text-center">
                <h1 class="text-2xl font-bold text-gray-900 mb-2">
                    Menghubungkan ke {{ $systemName }}...
                </h1>
                <p class="text-gray-600 mb-6">
                    Mohon tunggu sebentar, kami sedang mengamankan koneksi Anda
                </p>

                <!-- Progress Bar -->
                <div class="w-full bg-gray-200 rounded-full h-2 mb-6">
                    <div class="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full transition-all duration-1000"
                         style="width: 0%"
                         id="progress-bar"></div>
                </div>

                <!-- Status Messages -->
                <div class="space-y-2 text-sm text-gray-600" id="status-messages">
                    <div class="fade-in">✓ Membuat token aman...</div>
                    <div class="opacity-50">→ Memverifikasi identitas...</div>
                    <div class="opacity-50">→ Mengarahkan ke sistem...</div>
                </div>
            </div>

            <!-- Manual Redirect Link -->
            <div class="mt-8 text-center">
                <p class="text-xs text-gray-500">
                    Tidak terarah otomatis?
                    <a href="{{ $redirectUrl }}"
                       class="text-indigo-600 hover:text-indigo-800 font-medium underline">
                        Klik di sini
                    </a>
                </p>
            </div>
        </div>
    </div>

    <script>
        // Auto redirect after 2 seconds
        const redirectUrl = "{{ $redirectUrl }}";
        const progressBar = document.getElementById('progress-bar');

        // Animate progress bar
        setTimeout(() => {
            progressBar.style.width = '30%';
            document.getElementById('status-messages').children[1].classList.remove('opacity-50');
            document.getElementById('status-messages').children[1].classList.add('fade-in');
        }, 500);

        setTimeout(() => {
            progressBar.style.width = '60%';
            document.getElementById('status-messages').children[2].classList.remove('opacity-50');
            document.getElementById('status-messages').children[2].classList.add('fade-in');
        }, 1000);

        setTimeout(() => {
            progressBar.style.width = '100%';
            window.location.href = redirectUrl;
        }, 2000);
    </script>
</body>
</html>