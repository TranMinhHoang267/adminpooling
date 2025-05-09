$(document).ready(function () {
    console.log("Router.js: Document ready");
    
    const token = localStorage.getItem('token');
    console.log("Router.js: Token exists:", !!token);
    
    if (!token) {
        console.log("Router.js: No token found, redirecting to login");
        window.location.href = 'login.html';
        return;
    }

    const email = localStorage.getItem('email');
    if (email) {
        console.log("Router.js: Email found:", email);
        $('#currentUser').text(email);
    }

    $('#sidebarCollapse').on('click', function () {
        $('#sidebar').toggleClass('active');
    });

    $('#logoutBtn').on('click', function (e) {
        console.log("Router.js: Logout button clicked");
        e.preventDefault();
        localStorage.clear();
        window.location.href = 'login.html';
    });

    $('a[data-page]').on('click', function (e) {
        e.preventDefault();
        const page = $(this).data('page');
        console.log("Router.js: Navigation clicked for page:", page);
        loadContent(page);
        window.history.pushState(null, null, '?page=' + page);
    });

    function loadPageFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        const page = urlParams.get('page') || 'dashboard';
        console.log("Router.js: Loading page from URL:", page);
        loadContent(page);
    }

    function loadContent(page) {
        console.log("Router.js: Loading content for page:", page);
        
        $('a[data-page]').parent().removeClass('active');
        $('a[data-page="' + page + '"]').parent().addClass('active');

        $('#main-content').load('pages/' + page + '/index.html', function (response, status, xhr) {
            console.log("Router.js: Load status for", page, ":", status);
            if (status === 'error') {
                console.error("Router.js: Error loading page:", xhr.status, xhr.statusText);
                $('#main-content').html('<div class="alert alert-danger">Không thể tải trang. Vui lòng thử lại sau.</div>');
            } else {
                console.log("Router.js: Content loaded successfully for page:", page);
            }
        });
    }
    
    console.log("Router.js: Initializing page loading");
    loadPageFromURL();
});