<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">

        <title>{{ config('app.name', 'Laravel') }}</title>

        <!-- Preload Logo to prevent flashing -->
        <link rel="preload" href="{{ asset('logo.png') }}" as="image">

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />

        <!-- Font Awesome -->
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" integrity="sha512-iecdLmaskl7CVkqkXNQ/ZH/XLlvWZOJyj7Yy7tcenmpD1ypASozpmT/E0iPtmFIB46ZmdtAc9eNBvH0H/ZpiBw==" crossorigin="anonymous" referrerpolicy="no-referrer" />

      <!-- Scripts -->
        @vite(['resources/css/app.css', 'resources/js/app.js'])

        <script>
            // Prevent flash on navigation
            if ('scrollRestoration' in history) {
                history.scrollRestoration = 'manual';
            }

            // Smooth page transitions
            document.addEventListener('DOMContentLoaded', function() {
                // Preload logo if not already cached
                const logoImg = new Image();
                logoImg.src = '{{ asset("logo.png") }}';

                // Show page with smooth animation
                const mainContent = document.getElementById('main-content');
                if (mainContent) {
                    mainContent.style.opacity = '0';
                    mainContent.style.transform = 'translateY(10px)';

                    setTimeout(() => {
                        mainContent.style.transition = 'opacity 0.2s ease-out, transform 0.2s ease-out';
                        mainContent.style.opacity = '1';
                        mainContent.style.transform = 'translateY(0)';
                    }, 50);
                }

                // Add smooth transitions to all internal links
                const internalLinks = document.querySelectorAll('a[href^="/"], a[href^="{{ url("/") }}"]');
                internalLinks.forEach(link => {
                    if (!link.hasAttribute('target') && !link.hasAttribute('download') && !link.classList.contains('dropdown-toggle')) {
                        link.addEventListener('click', function(e) {
                            // Skip if modifier keys are pressed
                            if (e.ctrlKey || e.metaKey || e.shiftKey) return;

                            // Skip if it's a logout or form submission
                            if (this.getAttribute('onclick') && this.getAttribute('onclick').includes('submit')) return;

                            e.preventDefault();
                            const href = this.getAttribute('href');

                            // Smooth fade out
                            mainContent.style.transition = 'opacity 0.15s ease-out, transform 0.15s ease-out';
                            mainContent.style.opacity = '0';
                            mainContent.style.transform = 'translateY(10px)';

                            // Navigate after transition
                            setTimeout(() => {
                                window.location.href = href;
                            }, 150);
                        });
                    }
                });

                // Handle form submissions with smooth transition
                const forms = document.querySelectorAll('form');
                forms.forEach(form => {
                    form.addEventListener('submit', function(e) {
                        if (!form.getAttribute('action') || form.getAttribute('action').includes('logout')) return;

                        // Smooth fade out
                        mainContent.style.transition = 'opacity 0.15s ease-out, transform 0.15s ease-out';
                        mainContent.style.opacity = '0';
                        mainContent.style.transform = 'translateY(10px)';
                    });
                });
            });
        </script>
    </head>
    <body class="font-sans antialiased body-with-navbar">
        <div class="min-h-screen bg-gray-100">
            @include('layouts.navigation')

            <!-- Page Content -->
            <main class="main-container page-transition" id="main-content">
                {{ $slot }}
            </main>
        </div>
    </body>
</html>
