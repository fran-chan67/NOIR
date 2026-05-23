// ==========================================
// NOIR - E-commerce JavaScript
// ==========================================

// Firebase Config
var FIREBASE_CONFIG = {
    apiKey: "AIzaSyBvxKE1YDVdFq-aDE8eeC5oickvSs2y6K0",
    authDomain: "noir-2008.firebaseapp.com",
    projectId: "noir-2008",
    storageBucket: "noir-2008.firebasestorage.app",
    messagingSenderId: "551523230078",
    appId: "1:551523230078:web:9af448517f1beed99d932f"
};

// Google Sheets URL
var SHEETS_URL = 'https://script.google.com/macros/s/AKfycbwrb6yJU0VzabyYRuFi4Ou1nLWo0ijswM_DeATTelkMSKBs4pRj8g9YwI7xPxu-VnUGgQ/exec';

document.addEventListener('DOMContentLoaded', function() {
    CustomCursor.init();
    Header.init();
    MobileMenu.init();
    Cart.init();
    RevealAnimations.init();
    ProductGallery.init();
    ProductOptions.init();
    Accordion.init();
    Filters.init();
    ProductData.init();
    Search.init();
    Auth.init();
    Banner.init();
    Wishlist.init();
    Reviews.init();
    Newsletter.init();
});

// ==========================================
// Custom Cursor
// ==========================================
var CustomCursor = {
    cursor: null, follower: null,
    mouseX: 0, mouseY: 0, cursorX: 0, cursorY: 0, followerX: 0, followerY: 0,

    init: function() {
        this.cursor   = document.querySelector('.cursor');
        this.follower = document.querySelector('.cursor-follower');
        if (!this.cursor || !this.follower || window.innerWidth <= 1024) return;
        var self = this;
        document.addEventListener('mousemove', function(e) { self.mouseX = e.clientX; self.mouseY = e.clientY; });
        document.querySelectorAll('a, button, .product-card, input, select').forEach(function(el) {
            el.addEventListener('mouseenter', function() { self.follower.classList.add('hover'); });
            el.addEventListener('mouseleave', function() { self.follower.classList.remove('hover'); });
        });
        self.animate();
    },

    animate: function() {
        var self = this;
        this.cursorX   += (this.mouseX - this.cursorX)   * 0.2;
        this.cursorY   += (this.mouseY - this.cursorY)   * 0.2;
        this.followerX += (this.mouseX - this.followerX) * 0.1;
        this.followerY += (this.mouseY - this.followerY) * 0.1;
        this.cursor.style.left   = this.cursorX   + 'px';
        this.cursor.style.top    = this.cursorY   + 'px';
        this.follower.style.left = this.followerX + 'px';
        this.follower.style.top  = this.followerY + 'px';
        requestAnimationFrame(function() { self.animate(); });
    }
};

// ==========================================
// Header
// ==========================================
var Header = {
    init: function() {
        var header = document.getElementById('header');
        if (!header) return;
        function onScroll() {
            if (window.scrollY > 50) header.classList.add('scrolled');
            else header.classList.remove('scrolled');
        }
        window.addEventListener('scroll', onScroll);
        onScroll();
    }
};

// ==========================================
// Mobile Menu
// ==========================================
var MobileMenu = {
    init: function() {
        var toggle = document.getElementById('menuToggle');
        var menu   = document.getElementById('mobileMenu');
        if (!toggle || !menu) return;
        toggle.addEventListener('click', function() {
            toggle.classList.toggle('active');
            menu.classList.toggle('active');
        });
    }
};

// ==========================================
// AUTH (Firebase)
// ==========================================
var Auth = {
    firebaseAuth: null,
    currentUser:  null,

    init: function() {
        // Injeta estilos do painel de auth
        if (!document.getElementById('_authStyles')) {
            var s = document.createElement('style');
            s.id  = '_authStyles';
            s.textContent =
                '._authInput{width:100%;padding:12px 14px;border:1px solid #d0d0d0;font-family:Montserrat,sans-serif;font-size:.82rem;box-sizing:border-box;outline:none;transition:border .2s;}' +
                '._authInput:focus{border-color:#000;}' +
                '._authLabel{display:block;text-align:left;font-size:.68rem;letter-spacing:.12em;text-transform:uppercase;color:#707070;margin-bottom:5px;margin-top:14px;}' +
                '._authTab{flex:1;padding:10px;background:none;border:none;border-bottom:2px solid #e8e8e8;font-family:Montserrat,sans-serif;font-size:.72rem;letter-spacing:.12em;text-transform:uppercase;cursor:pointer;color:#a0a0a0;transition:all .2s;}' +
                '._authTab.active{border-bottom-color:#000;color:#000;font-weight:600;}' +
                '._authErr{color:#c00;font-size:.75rem;margin-top:8px;display:none;text-align:left;}' +
                '._authOk{color:#080;font-size:.75rem;margin-top:8px;display:none;text-align:left;}' +
                '#authBtn svg{transition:fill .2s;}' +
                '@keyframes _authFade{from{opacity:0}to{opacity:1}}' +
                '@keyframes _authSlide{from{transform:translateX(60px);opacity:0}to{transform:translateX(0);opacity:1}}';
            document.head.appendChild(s);
        }

        // Injeta botão de pessoa no header
        this.injectIcon();

        // Inicializa Firebase se SDK estiver disponível
        if (typeof firebase !== 'undefined') {
            if (!firebase.apps.length) firebase.initializeApp(FIREBASE_CONFIG);
            this.firebaseAuth = firebase.auth();
            var self = this;
            this.firebaseAuth.onAuthStateChanged(function(user) {
                self.currentUser = user;
                self.updateIcon();
                // Re-render reviews form agora que sabemos o estado do utilizador
                if (typeof Reviews !== 'undefined' && Reviews.productId) {
                    Reviews.renderForm();
                }
            });
        } else {
            console.warn('Firebase SDK não carregado. Adiciona os scripts do Firebase antes do script.js.');
        }
    },

    injectIcon: function() {
        var navActions = document.querySelector('.nav-actions');
        if (!navActions || document.getElementById('authBtn')) return;

        var btn = document.createElement('button');
        btn.id = 'authBtn';
        btn.setAttribute('aria-label', 'Conta');
        btn.style.cssText = 'background:none;border:none;cursor:pointer;padding:4px;display:inline-flex;align-items:center;justify-content:center;color:inherit;';
        btn.innerHTML =
            '<svg id="authBtnIcon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">' +
                '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>' +
                '<circle cx="12" cy="7" r="4"/>' +
            '</svg>';
        btn.addEventListener('click', function() { Auth.openPanel(); });

        // Inserir antes do botão do carrinho
        var cartBtn = document.getElementById('cartBtn');
        if (cartBtn) navActions.insertBefore(btn, cartBtn);
        else navActions.appendChild(btn);
    },

    updateIcon: function() {
        var icon = document.getElementById('authBtnIcon');
        if (!icon) return;
        if (this.currentUser) {
            // Utilizador logado: ícone preenchido
            icon.setAttribute('fill', 'currentColor');
        } else {
            icon.setAttribute('fill', 'none');
        }
    },

    openPanel: function() {
        if (document.getElementById('_authOverlay')) return;

        var overlay = document.createElement('div');
        overlay.id  = '_authOverlay';
        overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:9998;display:flex;align-items:stretch;justify-content:flex-end;animation:_authFade 0.3s ease;';

        var panel = document.createElement('div');
        panel.id  = '_authPanel';
        panel.style.cssText = 'background:#fff;width:420px;max-width:95vw;display:flex;flex-direction:column;padding:0;font-family:Montserrat,sans-serif;overflow-y:auto;animation:_authSlide 0.4s cubic-bezier(.16,1,.3,1);';

        if (this.currentUser) {
            panel.innerHTML = this._buildLoggedInPanel();
        } else {
            panel.innerHTML = this._buildAuthPanel();
        }

        overlay.appendChild(panel);
        document.body.appendChild(overlay);
        document.body.style.overflow = 'hidden';

        // Fechar ao clicar fora
        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) Auth.closePanel();
        });

        // Bind eventos
        if (this.currentUser) {
            this._bindLoggedInEvents();
        } else {
            this._bindAuthEvents();
        }
    },

    closePanel: function() {
        var el = document.getElementById('_authOverlay');
        if (el) el.remove();
        document.body.style.overflow = '';
    },

    _buildAuthPanel: function() {
        return (
            '<div style="padding:40px 40px 0;">' +
                '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:28px;">' +
                    '<h2 style="font-family:\'Cormorant Garamond\',serif;font-size:1.7rem;font-weight:400;letter-spacing:.06em;margin:0;">A minha conta</h2>' +
                    '<button id="_authClose" style="background:none;border:none;cursor:pointer;padding:4px;">' +
                        '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="1.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>' +
                    '</button>' +
                '</div>' +
                '<div style="display:flex;margin-bottom:28px;">' +
                    '<button class="_authTab active" id="_tabLogin">Iniciar Sessão</button>' +
                    '<button class="_authTab" id="_tabRegister">Criar Conta</button>' +
                '</div>' +
            '</div>' +

            // Painel Login
            '<div id="_formLogin" style="padding:0 40px 40px;">' +
                '<label class="_authLabel">Email</label>' +
                '<input class="_authInput" id="_loginEmail" type="email" placeholder="email@exemplo.com" autocomplete="email">' +
                '<label class="_authLabel">Password</label>' +
                '<input class="_authInput" id="_loginPass" type="password" placeholder="••••••••" autocomplete="current-password">' +
                '<p class="_authErr" id="_loginErr"></p>' +
                '<button id="_loginBtn" style="background:#000;color:#fff;border:none;padding:14px 0;font-size:.72rem;font-weight:500;letter-spacing:.15em;text-transform:uppercase;cursor:pointer;width:100%;margin-top:20px;font-family:Montserrat,sans-serif;">Entrar</button>' +
            '</div>' +

            // Painel Registo (escondido)
            '<div id="_formRegister" style="padding:0 40px 40px;display:none;">' +
                '<label class="_authLabel">Nome completo</label>' +
                '<input class="_authInput" id="_regNome" type="text" placeholder="João Silva" autocomplete="name">' +
                '<label class="_authLabel">Email</label>' +
                '<input class="_authInput" id="_regEmail" type="email" placeholder="email@exemplo.com" autocomplete="email">' +
                '<label class="_authLabel">Password</label>' +
                '<input class="_authInput" id="_regPass" type="password" placeholder="Mínimo 6 caracteres" autocomplete="new-password">' +
                '<p class="_authErr" id="_regErr"></p>' +
                '<button id="_regBtn" style="background:#000;color:#fff;border:none;padding:14px 0;font-size:.72rem;font-weight:500;letter-spacing:.15em;text-transform:uppercase;cursor:pointer;width:100%;margin-top:20px;font-family:Montserrat,sans-serif;">Criar Conta</button>' +
            '</div>'
        );
    },

    _buildLoggedInPanel: function() {
        var user    = this.currentUser;
        var profile = Auth.getProfile();
        var nome    = profile.nome || user.email;

        return (
            '<div style="padding:40px;">' +
                '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:32px;">' +
                    '<h2 style="font-family:\'Cormorant Garamond\',serif;font-size:1.7rem;font-weight:400;letter-spacing:.06em;margin:0;">A minha conta</h2>' +
                    '<button id="_authClose" style="background:none;border:none;cursor:pointer;padding:4px;">' +
                        '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="1.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>' +
                    '</button>' +
                '</div>' +

                // Saudação
                '<div style="background:#f8f8f8;padding:20px;margin-bottom:28px;">' +
                    '<p style="font-size:.68rem;letter-spacing:.15em;text-transform:uppercase;color:#a0a0a0;margin:0 0 4px;">Bem-vindo</p>' +
                    '<p style="font-size:1.1rem;font-family:\'Cormorant Garamond\',serif;margin:0;">' + nome + '</p>' +
                    '<p style="font-size:.78rem;color:#707070;margin:4px 0 0;">' + user.email + '</p>' +
                '</div>' +

                // Dados guardados
                '<p style="font-size:.68rem;letter-spacing:.15em;text-transform:uppercase;color:#a0a0a0;margin:0 0 16px;">Dados de entrega guardados</p>' +

                '<label class="_authLabel">Nome completo</label>' +
                '<input class="_authInput" id="_profNome" type="text" value="' + (profile.nome || '') + '" placeholder="João Silva">' +

                '<label class="_authLabel">Telemóvel</label>' +
                '<input class="_authInput" id="_profTel" type="tel" value="' + (profile.telemovel || '') + '" placeholder="+351 912 345 678">' +

                '<label class="_authLabel">País</label>' +
                '<input class="_authInput" id="_profPais" type="text" value="' + (profile.pais || '') + '" placeholder="Portugal">' +

                '<label class="_authLabel">Código Postal</label>' +
                '<input class="_authInput" id="_profCp" type="text" value="' + (profile.codigoPostal || '') + '" placeholder="1000-001">' +

                '<label class="_authLabel">Morada</label>' +
                '<input class="_authInput" id="_profMorada" type="text" value="' + (profile.morada || '') + '" placeholder="Rua X, nº Y, Cidade">' +

                '<p class="_authOk" id="_profOk">Dados guardados com sucesso!</p>' +
                '<button id="_profSaveBtn" style="background:#000;color:#fff;border:none;padding:14px 0;font-size:.72rem;font-weight:500;letter-spacing:.15em;text-transform:uppercase;cursor:pointer;width:100%;margin-top:20px;font-family:Montserrat,sans-serif;">Guardar Dados</button>' +

                '<button id="_logoutBtn" style="background:none;color:#000;border:1px solid #000;padding:12px 0;font-size:.72rem;font-weight:500;letter-spacing:.15em;text-transform:uppercase;cursor:pointer;width:100%;margin-top:12px;font-family:Montserrat,sans-serif;">Terminar Sessão</button>' +
            '</div>'
        );
    },

    _bindAuthEvents: function() {
        // Fechar
        document.getElementById('_authClose').addEventListener('click', function() { Auth.closePanel(); });

        // Tabs
        document.getElementById('_tabLogin').addEventListener('click', function() {
            document.getElementById('_tabLogin').classList.add('active');
            document.getElementById('_tabRegister').classList.remove('active');
            document.getElementById('_formLogin').style.display = 'block';
            document.getElementById('_formRegister').style.display = 'none';
        });
        document.getElementById('_tabRegister').addEventListener('click', function() {
            document.getElementById('_tabRegister').classList.add('active');
            document.getElementById('_tabLogin').classList.remove('active');
            document.getElementById('_formRegister').style.display = 'block';
            document.getElementById('_formLogin').style.display = 'none';
        });

        // Login
        document.getElementById('_loginBtn').addEventListener('click', function() {
            var email = document.getElementById('_loginEmail').value.trim();
            var pass  = document.getElementById('_loginPass').value;
            var errEl = document.getElementById('_loginErr');
            errEl.style.display = 'none';

            if (!email || !pass) { errEl.textContent = 'Preenche todos os campos.'; errEl.style.display = 'block'; return; }

            var btn = document.getElementById('_loginBtn');
            btn.textContent = 'A entrar...'; btn.disabled = true;

            Auth.firebaseAuth.signInWithEmailAndPassword(email, pass)
                .then(function() { Auth.closePanel(); })
                .catch(function(err) {
                    btn.textContent = 'Entrar'; btn.disabled = false;
                    errEl.textContent = err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password'
                        ? 'Email ou password incorretos.'
                        : err.code === 'auth/user-not-found'
                        ? 'Conta não encontrada.'
                        : 'Erro ao iniciar sessão. Tenta novamente.';
                    errEl.style.display = 'block';
                });
        });

        // Registo
        document.getElementById('_regBtn').addEventListener('click', function() {
            var nome  = document.getElementById('_regNome').value.trim();
            var email = document.getElementById('_regEmail').value.trim();
            var pass  = document.getElementById('_regPass').value;
            var errEl = document.getElementById('_regErr');
            errEl.style.display = 'none';

            if (!nome || !email || !pass) { errEl.textContent = 'Preenche todos os campos.'; errEl.style.display = 'block'; return; }
            if (pass.length < 6)          { errEl.textContent = 'A password deve ter mínimo 6 caracteres.'; errEl.style.display = 'block'; return; }

            var btn = document.getElementById('_regBtn');
            btn.textContent = 'A criar...'; btn.disabled = true;

            Auth.firebaseAuth.createUserWithEmailAndPassword(email, pass)
                .then(function(cred) {
                    // Guardar nome no perfil local
                    Auth.saveProfile({ nome: nome });
                    Auth.closePanel();
                })
                .catch(function(err) {
                    btn.textContent = 'Criar Conta'; btn.disabled = false;
                    errEl.textContent = err.code === 'auth/email-already-in-use'
                        ? 'Este email já está registado.'
                        : err.code === 'auth/weak-password'
                        ? 'Password demasiado fraca.'
                        : 'Erro ao criar conta. Tenta novamente.';
                    errEl.style.display = 'block';
                });
        });

        // Enter nos inputs
        ['_loginEmail','_loginPass'].forEach(function(id) {
            document.getElementById(id).addEventListener('keydown', function(e) {
                if (e.key === 'Enter') document.getElementById('_loginBtn').click();
            });
        });
    },

    _bindLoggedInEvents: function() {
        document.getElementById('_authClose').addEventListener('click', function() { Auth.closePanel(); });

        document.getElementById('_profSaveBtn').addEventListener('click', function() {
            Auth.saveProfile({
                nome:        document.getElementById('_profNome').value.trim(),
                telemovel:   document.getElementById('_profTel').value.trim(),
                pais:        document.getElementById('_profPais').value.trim(),
                codigoPostal:document.getElementById('_profCp').value.trim(),
                morada:      document.getElementById('_profMorada').value.trim()
            });
            var ok = document.getElementById('_profOk');
            ok.style.display = 'block';
            setTimeout(function() { ok.style.display = 'none'; }, 3000);
        });

        document.getElementById('_logoutBtn').addEventListener('click', function() {
            Auth.firebaseAuth.signOut().then(function() { Auth.closePanel(); });
        });
    },

    getProfile: function() {
        var uid = this.currentUser ? this.currentUser.uid : '_guest';
        return JSON.parse(localStorage.getItem('noirProfile_' + uid) || '{}');
    },

    saveProfile: function(data) {
        var uid = this.currentUser ? this.currentUser.uid : '_guest';
        var existing = this.getProfile();
        var merged   = {};
        for (var k in existing) merged[k] = existing[k];
        for (var k in data)     merged[k] = data[k];
        localStorage.setItem('noirProfile_' + uid, JSON.stringify(merged));
    }
};

// ==========================================
// Cart
// ==========================================
var Cart = {
    items: [],

    init: function() {
        this.items = JSON.parse(localStorage.getItem('noirCart') || '[]');

        var cartBtn     = document.getElementById('cartBtn');
        var cartClose   = document.getElementById('cartClose');
        var cartOverlay = document.getElementById('cartOverlay');
        var addBtn      = document.getElementById('addToCartBtn');

        if (cartBtn)     cartBtn.addEventListener('click',     function() { Cart.open(); });
        if (cartClose)   cartClose.addEventListener('click',   function() { Cart.close(); });
        if (cartOverlay) cartOverlay.addEventListener('click', function() { Cart.close(); });
        if (addBtn)      addBtn.addEventListener('click',      function() { Cart.addCurrentProduct(); });

        // Checkout via event delegation
        document.body.addEventListener('click', function(e) {
            var footer = document.getElementById('cartFooter');
            if (!footer) return;
            var btn = e.target.closest('button');
            if (btn && footer.contains(btn)) Cart.checkout();
        });

        this.updateUI();
    },

    open: function() {
        var s = document.getElementById('cartSidebar');
        var o = document.getElementById('cartOverlay');
        if (s) s.classList.add('active');
        if (o) o.classList.add('active');
        document.body.style.overflow = 'hidden';
    },

    close: function() {
        var s = document.getElementById('cartSidebar');
        var o = document.getElementById('cartOverlay');
        if (s) s.classList.remove('active');
        if (o) o.classList.remove('active');
        document.body.style.overflow = '';
    },

    addCurrentProduct: function() {
        var titleEl = document.getElementById('productTitle');
        var priceEl = document.getElementById('productPrice');
        var imgEl   = document.getElementById('mainImage');
        var sizeEl  = document.querySelector('.size-option.active');

        if (!sizeEl) { alert('Por favor selecione um tamanho.'); return; }

        var title = titleEl ? titleEl.textContent : '';
        var price = priceEl ? priceEl.textContent : '';
        var image = imgEl   ? imgEl.src           : '';
        var size  = sizeEl.dataset.size;

        var existing = null;
        for (var i = 0; i < this.items.length; i++) {
            if (this.items[i].title === title && this.items[i].size === size) { existing = this.items[i]; break; }
        }
        if (existing) { existing.qty++; }
        else          { this.items.push({ title: title, price: price, image: image, size: size, qty: 1 }); }

        this.saveCart();
        this.updateUI();
        this.open();
    },

    saveCart: function() {
        localStorage.setItem('noirCart', JSON.stringify(this.items));
    },

    checkout: function() {
        if (this.items.length === 0) return;
        Cart.close();

        // Estilos
        if (!document.getElementById('_nst')) {
            var st = document.createElement('style');
            st.id  = '_nst';
            st.textContent =
                '@keyframes _nFade{from{opacity:0}to{opacity:1}}' +
                '@keyframes _nSlide{from{transform:translateX(60px);opacity:0}to{transform:translateX(0);opacity:1}}' +
                '._coInput{width:100%;padding:12px 14px;border:1px solid #d0d0d0;font-family:Montserrat,sans-serif;font-size:.82rem;box-sizing:border-box;outline:none;transition:border .2s;}' +
                '._coInput:focus{border-color:#000;}' +
                '._coLabel{display:block;text-align:left;font-size:.68rem;letter-spacing:.12em;text-transform:uppercase;color:#707070;margin-bottom:5px;margin-top:14px;}' +
                '._coRow{display:grid;grid-template-columns:1fr 1fr;gap:12px;}' +
                '._coErr{color:#c00;font-size:.75rem;margin-top:6px;display:none;}';
            document.head.appendChild(st);
        }

        var total = 0;
        for (var i = 0; i < this.items.length; i++) {
            var p = parseFloat(this.items[i].price.replace(/[€,\s]/g, '')) || 0;
            total += p * this.items[i].qty;
        }
        var totalStr  = '\u20ac' + total.toFixed(2);
        var itensList = this.items.map(function(it) {
            return it.title + ' (tam.' + it.size + ') x' + it.qty;
        }).join(' | ');

        // Pré-preencher com dados do perfil se logado
        var profile = Auth.getProfile();

        var overlay = document.createElement('div');
        overlay.id  = '_coOverlay';
        overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.55);z-index:9999;display:flex;align-items:stretch;justify-content:flex-end;animation:_nFade 0.3s ease;';

        var panel = document.createElement('div');
        panel.style.cssText = 'background:#fff;width:480px;max-width:95vw;display:flex;flex-direction:column;padding:48px 40px;font-family:Montserrat,sans-serif;overflow-y:auto;animation:_nSlide 0.4s cubic-bezier(.16,1,.3,1);';

        // Aviso de login se não estiver logado
        var loginHint = '';
        if (!Auth.currentUser) {
            loginHint = '<div style="background:#f8f8f8;padding:12px 16px;margin-bottom:20px;display:flex;align-items:center;gap:10px;">' +
                '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#707070" stroke-width="1.5"><circle cx="12" cy="7" r="4"/><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/></svg>' +
                '<p style="font-size:.75rem;color:#707070;margin:0;">Tens conta? <a href="#" id="_coLoginLink" style="color:#000;text-decoration:underline;">Inicia sessão</a> para preencher automaticamente.</p>' +
            '</div>';
        }

        panel.innerHTML =
            '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:28px;">' +
                '<h2 style="font-family:\'Cormorant Garamond\',serif;font-size:1.7rem;font-weight:400;letter-spacing:.06em;margin:0;">Finalizar Compra</h2>' +
                '<button id="_coX" style="background:none;border:none;cursor:pointer;padding:4px;">' +
                    '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="1.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>' +
                '</button>' +
            '</div>' +

            loginHint +

            // Resumo
            '<div style="background:#f8f8f8;padding:16px;margin-bottom:24px;">' +
                '<p style="font-size:.68rem;letter-spacing:.15em;text-transform:uppercase;color:#a0a0a0;margin:0 0 10px;">Resumo</p>' +
                '<p style="font-size:.82rem;color:#333;line-height:1.7;margin:0 0 10px;">' + itensList.replace(/\|/g, '<br>') + '</p>' +
                '<p style="font-size:1rem;font-family:\'Cormorant Garamond\',serif;font-weight:500;margin:0;border-top:1px solid #e0e0e0;padding-top:10px;">Total: ' + totalStr + '</p>' +
            '</div>' +

            // Campos
            '<label class="_coLabel">Nome completo *</label>' +
            '<input class="_coInput" id="_coNome" type="text" placeholder="João Silva" value="' + (profile.nome || '') + '">' +

            '<label class="_coLabel">Email *</label>' +
            '<input class="_coInput" id="_coEmail" type="email" placeholder="email@exemplo.com" value="' + (Auth.currentUser ? Auth.currentUser.email : '') + '">' +

            '<label class="_coLabel">Telemóvel *</label>' +
            '<input class="_coInput" id="_coTel" type="tel" placeholder="+351 912 345 678" value="' + (profile.telemovel || '') + '">' +

            '<label class="_coLabel">País *</label>' +
            '<input class="_coInput" id="_coPais" type="text" placeholder="Portugal" value="' + (profile.pais || '') + '">' +

            '<div class="_coRow">' +
                '<div>' +
                    '<label class="_coLabel">Código Postal *</label>' +
                    '<input class="_coInput" id="_coCp" type="text" placeholder="1000-001" value="' + (profile.codigoPostal || '') + '">' +
                '</div>' +
                '<div>' +
                    '<label class="_coLabel">Cidade *</label>' +
                    '<input class="_coInput" id="_coCidade" type="text" placeholder="Lisboa" value="' + (profile.cidade || '') + '">' +
                '</div>' +
            '</div>' +

            '<label class="_coLabel">Morada *</label>' +
            '<input class="_coInput" id="_coMorada" type="text" placeholder="Rua X, nº Y" value="' + (profile.morada || '') + '">' +

            '<p class="_coErr" id="_coErr">Por favor preencha todos os campos.</p>' +

            '<button id="_coSubmit" style="background:#000;color:#fff;border:none;padding:16px 0;font-size:.75rem;font-weight:500;letter-spacing:.15em;text-transform:uppercase;cursor:pointer;width:100%;margin-top:24px;font-family:Montserrat,sans-serif;">Confirmar Encomenda</button>' +
            '<p style="font-size:.72rem;color:#a0a0a0;text-align:center;margin-top:12px;">Os seus dados são usados apenas para processar a encomenda.</p>';

        overlay.appendChild(panel);
        document.body.appendChild(overlay);
        document.body.style.overflow = 'hidden';

        // Fechar X → volta ao carrinho
        document.getElementById('_coX').addEventListener('click', function() {
            var el = document.getElementById('_coOverlay');
            if (el) el.remove();
            document.body.style.overflow = '';
            Cart.open();
        });

        // Link de login dentro do checkout
        var loginLink = document.getElementById('_coLoginLink');
        if (loginLink) {
            loginLink.addEventListener('click', function(e) {
                e.preventDefault();
                var el = document.getElementById('_coOverlay');
                if (el) el.remove();
                document.body.style.overflow = '';
                Auth.openPanel();
            });
        }

        // Submeter
        document.getElementById('_coSubmit').addEventListener('click', function() {
            var nome   = document.getElementById('_coNome').value.trim();
            var email  = document.getElementById('_coEmail').value.trim();
            var tel    = document.getElementById('_coTel').value.trim();
            var pais   = document.getElementById('_coPais').value.trim();
            var cp     = document.getElementById('_coCp').value.trim();
            var cidade = document.getElementById('_coCidade').value.trim();
            var morada = document.getElementById('_coMorada').value.trim();
            var errEl  = document.getElementById('_coErr');

            if (!nome || !email || !tel || !pais || !cp || !cidade || !morada) {
                errEl.style.display = 'block'; return;
            }
            errEl.style.display = 'none';

            // Guardar dados no perfil se logado
            if (Auth.currentUser) {
                Auth.saveProfile({ nome: nome, telemovel: tel, pais: pais, codigoPostal: cp, cidade: cidade, morada: morada });
            }

            var btn = document.getElementById('_coSubmit');
            btn.textContent = 'A enviar...'; btn.style.opacity = '0.6'; btn.disabled = true;

            // Gerar número de encomenda único
            var orderNum = 'NOIR-' + Math.floor(1000 + Math.random() * 9000);

            var payload = {
                type: 'checkout',
                encomenda: orderNum,
                nome: nome, email: email, telemovel: tel,
                pais: pais, codigoPostal: cp, cidade: cidade,
                morada: morada, itens: itensList, total: totalStr
            };

            fetch(SHEETS_URL, { method: 'POST', body: JSON.stringify(payload) })
                .then(function()  { Cart._showConfirmation(nome, totalStr, orderNum); })
                .catch(function() { Cart._showConfirmation(nome, totalStr, orderNum); });
        });
    },

    _showConfirmation: function(nome, totalStr, orderNum) {
        var el = document.getElementById('_coOverlay');
        if (el) el.remove();

        var overlay = document.createElement('div');
        overlay.id  = '_coOverlay';
        overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.55);z-index:9999;display:flex;align-items:stretch;justify-content:flex-end;animation:_nFade 0.3s ease;';

        var panel = document.createElement('div');
        panel.style.cssText = 'background:#fff;width:480px;max-width:95vw;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:60px 40px;text-align:center;font-family:Montserrat,sans-serif;animation:_nSlide 0.4s cubic-bezier(.16,1,.3,1);';
        panel.innerHTML =
            '<svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="1" style="margin-bottom:24px"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>' +
            '<h2 style="font-family:\'Cormorant Garamond\',serif;font-size:2rem;font-weight:400;letter-spacing:.1em;margin:0 0 10px">Encomenda Confirmada</h2>' +
            '<p style="font-size:.75rem;letter-spacing:.15em;text-transform:uppercase;color:#707070;margin:0 0 8px">Obrigado, ' + nome.split(' ')[0] + '!</p>' +
            '<p style="font-size:.85rem;color:#505050;line-height:1.8;margin:0 0 28px">O seu pedido foi recebido com sucesso.<br>Receberá em breve uma confirmação por email.</p>' +
            '<div style="border-top:1px solid #e8e8e8;border-bottom:1px solid #e8e8e8;padding:16px 0;margin-bottom:32px;width:100%">' +
                '<p style="font-size:.7rem;letter-spacing:.2em;text-transform:uppercase;color:#a0a0a0;margin:0 0 6px">N.º Encomenda</p>' +
                '<p style="font-size:1.1rem;font-family:\'Cormorant Garamond\',serif;font-weight:500;margin:0 0 12px;letter-spacing:.08em">' + (orderNum || '') + '</p>' +
                '<p style="font-size:.7rem;letter-spacing:.2em;text-transform:uppercase;color:#a0a0a0;margin:0 0 6px">Total</p>' +
                '<p style="font-size:1.6rem;font-family:\'Cormorant Garamond\',serif;font-weight:400;margin:0">' + totalStr + '</p>' +
            '</div>' +
            '<button id="_coClose" style="background:#000;color:#fff;border:none;padding:16px 0;font-size:.75rem;font-weight:500;letter-spacing:.15em;text-transform:uppercase;cursor:pointer;width:100%;font-family:Montserrat,sans-serif">Continuar a Comprar</button>';

        overlay.appendChild(panel);
        document.body.appendChild(overlay);

        function done() {
            var el = document.getElementById('_coOverlay');
            if (el) el.remove();
            document.body.style.overflow = '';
            Cart.items = [];
            Cart.saveCart();
            Cart.updateUI();
        }

        document.getElementById('_coClose').addEventListener('click', done);
        overlay.addEventListener('click', function(e) { if (e.target === overlay) done(); });
    },

    updateUI: function() {
        var count = 0;
        for (var i = 0; i < this.items.length; i++) count += this.items[i].qty;
        document.querySelectorAll('#cartCount').forEach(function(el) { el.textContent = count; });

        var cartItemsEl  = document.getElementById('cartItems');
        var cartEmptyEl  = document.getElementById('cartEmpty');
        var cartFooterEl = document.getElementById('cartFooter');
        var subtotalEl   = document.getElementById('cartSubtotal');
        if (!cartItemsEl) return;

        if (this.items.length === 0) {
            cartItemsEl.innerHTML = '';
            if (cartEmptyEl)  cartEmptyEl.style.display = 'flex';
            if (cartFooterEl) cartFooterEl.classList.remove('visible');
            return;
        }

        if (cartEmptyEl)  cartEmptyEl.style.display = 'none';
        if (cartFooterEl) cartFooterEl.classList.add('visible');

        var total = 0;
        var html  = '';
        for (var i = 0; i < this.items.length; i++) {
            var item = this.items[i];
            var pv   = parseFloat(item.price.replace(/[€,\s]/g, '')) || 0;
            total   += pv * item.qty;
            html    += '<div class="cart-item">' +
                '<div class="cart-item-image"><img src="' + item.image + '" alt="' + item.title + '"></div>' +
                '<div class="cart-item-details">' +
                    '<p class="cart-item-name">'    + item.title + '</p>' +
                    '<p class="cart-item-variant">Tamanho: ' + item.size + '</p>' +
                    '<div class="cart-item-quantity">' +
                        '<button onclick="Cart.changeQty(' + i + ',-1)">\u2212</button>' +
                        '<span>' + item.qty + '</span>' +
                        '<button onclick="Cart.changeQty(' + i + ',1)">+</button>' +
                    '</div>' +
                    '<p class="cart-item-price">' + item.price + '</p>' +
                    '<button class="cart-item-remove" onclick="Cart.remove(' + i + ')">Remover</button>' +
                '</div></div>';
        }
        cartItemsEl.innerHTML = html;
        if (subtotalEl) subtotalEl.textContent = '\u20ac' + total.toFixed(2);
    },

    changeQty: function(idx, delta) {
        this.items[idx].qty += delta;
        if (this.items[idx].qty <= 0) this.items.splice(idx, 1);
        this.saveCart(); this.updateUI();
    },

    remove: function(idx) {
        this.items.splice(idx, 1);
        this.saveCart(); this.updateUI();
    }
};

// ==========================================
// Reveal Animations
// ==========================================
var RevealAnimations = {
    init: function() {
        var els = document.querySelectorAll('.reveal');
        if (!els.length) return;
        var obs = new IntersectionObserver(function(entries) {
            entries.forEach(function(e) { if (e.isIntersecting) e.target.classList.add('visible'); });
        }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
        els.forEach(function(el) { obs.observe(el); });
    }
};

// ==========================================
// Product Gallery
// ==========================================
var ProductGallery = {
    init: function() {
        var g = document.getElementById('productGallery');
        if (!g) return;
        g.addEventListener('click', function(e) {
            var thumb = e.target.closest('.gallery-thumbnail');
            if (!thumb) return;
            var src = thumb.querySelector('img');
            if (src) { var m = document.getElementById('mainImage'); if (m) m.src = src.src; }
            g.querySelectorAll('.gallery-thumbnail').forEach(function(t) { t.classList.remove('active'); });
            thumb.classList.add('active');
        });
    }
};

// ==========================================
// Product Options
// ==========================================
var ProductOptions = {
    init: function() {
        var s = document.getElementById('sizeSelector');
        if (!s) return;
        s.addEventListener('click', function(e) {
            var btn = e.target.closest('.size-option');
            if (!btn) return;
            s.querySelectorAll('.size-option').forEach(function(b) { b.classList.remove('active'); });
            btn.classList.add('active');
        });
    }
};

// ==========================================
// Accordion
// ==========================================
var Accordion = {
    init: function() {
        var items = document.querySelectorAll('.accordion-item');
        items.forEach(function(item) {
            var h = item.querySelector('.accordion-header');
            if (!h) return;
            h.addEventListener('click', function() {
                var was = item.classList.contains('active');
                items.forEach(function(i) { i.classList.remove('active'); });
                if (!was) item.classList.add('active');
            });
        });
    }
};

// ==========================================
// Filters
// ==========================================
var Filters = {
    init: function() {
        var panel  = document.getElementById('filterPanel');
        var toggle = document.getElementById('filterToggle');
        if (!panel || !toggle) return;

        var products = Array.from(document.querySelectorAll('.product-card'));

        toggle.addEventListener('click', function() { panel.classList.toggle('active'); });

        var clearBtn = document.getElementById('clearFilters');
        if (clearBtn) clearBtn.addEventListener('click', function() {
            panel.querySelectorAll('input[type="checkbox"]').forEach(function(cb) { cb.checked = false; });
            products.forEach(function(p) { p.style.display = ''; });
            panel.classList.remove('active');
        });

        var applyBtn = document.getElementById('applyFilters');
        if (applyBtn) applyBtn.addEventListener('click', function() {
            var sizes  = Array.from(panel.querySelectorAll('input[name="size"]:checked')).map(function(c) { return c.value; });
            var prices = Array.from(panel.querySelectorAll('input[name="price"]:checked')).map(function(c) { return c.value; });

            products.forEach(function(p) {
                var show = true;
                if (sizes.length) {
                    var ps = (p.dataset.size || '').split(',');
                    show = show && sizes.some(function(s) { return ps.indexOf(s) !== -1; });
                }
                if (prices.length) {
                    var pv = parseFloat(p.dataset.price) || 0;
                    show = show && prices.some(function(r) {
                        if (r.indexOf('+') !== -1) return pv >= parseFloat(r);
                        var pts = r.split('-');
                        return pv >= parseFloat(pts[0]) && pv <= parseFloat(pts[1]);
                    });
                }
                p.style.display = show ? '' : 'none';
            });
            panel.classList.remove('active');
        });

        var sortSelect = document.getElementById('sortSelect');
        if (sortSelect) {
            var grid = document.getElementById('productsGrid');

            // Guardar ordem original ao carregar
            var originalOrder = products.slice();
            products.forEach(function(p, i) { p.dataset.originalIndex = i; });

            function applySort(val) {
                if (!grid) return;
                var sorted = products.slice().sort(function(a, b) {
                    var pa = parseFloat(a.dataset.price) || 0;
                    var pb = parseFloat(b.dataset.price) || 0;
                    if (val === 'price-asc')  return pa - pb;
                    if (val === 'price-desc') return pb - pa;
                    if (val === 'featured' || val === 'newest') {
                        return parseInt(a.dataset.originalIndex) - parseInt(b.dataset.originalIndex);
                    }
                    return 0;
                });
                sorted.forEach(function(p) { grid.appendChild(p); });
            }
            applySort(sortSelect.value);
            sortSelect.addEventListener('change', function(e) { applySort(e.target.value); });
        }
    }
};

// ==========================================
// Search
// ==========================================
var Search = {
    init: function() {
        var overlay  = document.getElementById('searchOverlay');
        var input    = document.getElementById('searchOverlayInput');
        var grid     = document.getElementById('searchResultsGrid');
        var hint     = document.getElementById('searchHint');
        var closeBtn = document.getElementById('searchOverlayClose');

        if (!overlay) return;

        function open() {
            overlay.classList.add('active');
            document.body.style.overflow = 'hidden';
            if (grid) grid.innerHTML = '';
            if (hint) hint.style.display = 'block';
            setTimeout(function() { if (input) input.focus(); }, 100);
        }
        function close() {
            overlay.classList.remove('active');
            document.body.style.overflow = '';
            if (input) input.value = '';
            if (grid)  grid.innerHTML = '';
            if (hint)  hint.style.display = 'block';
        }

        document.querySelectorAll('.search-btn').forEach(function(btn) { btn.addEventListener('click', open); });
        if (closeBtn) closeBtn.addEventListener('click', close);
        document.addEventListener('keydown', function(e) { if (e.key === 'Escape') close(); });

        if (input) input.addEventListener('input', function() {
            var q = input.value.trim().toLowerCase();
            if (!q) { if (grid) grid.innerHTML = ''; if (hint) hint.style.display = 'block'; return; }
            if (hint) hint.style.display = 'none';

            var results = Object.keys(ProductData.products).filter(function(id) {
                return ProductData.products[id].name.toLowerCase().indexOf(q) !== -1;
            });

            if (!results.length) { if (grid) grid.innerHTML = '<p class="search-no-results">Nenhum produto encontrado.</p>'; return; }

            var html = '';
            results.forEach(function(id) {
                var p = ProductData.products[id];
                html += '<a href="produto.html?id=' + id + '" class="search-result-card" onclick="document.getElementById(\'searchOverlay\').classList.remove(\'active\');document.body.style.overflow=\'\';">' +
                    '<div class="search-result-image"><img src="' + p.images[0] + '" alt="' + p.name + '"></div>' +
                    '<div class="search-result-info"><p class="search-result-name">' + p.name + '</p><p class="search-result-price">' + p.price + '</p></div>' +
                '</a>';
            });
            if (grid) grid.innerHTML = html;
        });
    }
};

// ==========================================
// ProductData
// IDs 1-99  = ROUPA  → S/M/L/XL
// IDs 100+  = SAPATOS → 38-44
// ==========================================
var ProductData = {
    products: {
        1:   { name: 'Ami Paris Sweat',                        price: '79.99€',  description: 'Blazer de corte estruturado em lã italiana de primeira qualidade.',                                  details: '100% Lã Virgem Italiana | Forro em seda natural | Botões de chifre genuíno | Fabricado em Itália',       images: ['roupa/ami_paris_sweat_1.png',          'roupa/ami_paris_sweat_2.png',          'roupa/ami_paris_sweat_3.png'] },
        2:   { name: 'Burberry T-shirt',                       price: '59.99€',  description: 'Camisa em algodão egípcio de 200 fios. Colarinho italiano e botões em madrepérola genuína.',          details: '100% Algodão Egípcio | Colarinho italiano | Punhos duplos | Botões em madrepérola',                      images: ['roupa/burberry_tshirt_1.png',          'roupa/burberry_tshirt_2.png',          'roupa/burberry_tshirt_3.png'] },
        3:   { name: 'Chrome Hearts Triple Cross Sweat',       price: '79.99€',  description: 'Sweater de corte alfaiataria em lã tropical italiana.',                                               details: '100% Lã Tropical Italiana | Cintura média | Pregas simples | Bainha tradicional',                       images: ['roupa/chrome_hearts_sweat_1.png',      'roupa/chrome_hearts_sweat_2.png',      'roupa/chrome_hearts_sweat_3.png'] },
        4:   { name: 'Denim Tears Hoodie',                     price: '99.99€',  description: 'Casaco oversize em lã virgem e cashmere com silhueta relaxada.',                                      details: 'Mistura Lã Virgem e Cashmere | Silhueta oversized | Fecho com botões escondidos | Fabricado em Itália',  images: ['roupa/denim_tears_hoodie_1.png',       'roupa/denim_tears_hoodie_2.png',       'roupa/denim_tears_hoodie_3.png'] },
        5:   { name: 'Jeffrey Epstein Quarter Zip',            price: '74.99€',  description: 'Camisola em puro cashmere escocês de toque inigualável.',                                             details: '100% Cashmere Escocês | Decote redondo | Costuras reforçadas',                                          images: ['roupa/epstein_quarter_zip_1.png',      'roupa/epstein_quarter_zip_2.png',      'roupa/epstein_quarter_zip_3.png'] },
        6:   { name: 'Essentials Hoodie',                      price: '89.99€',  description: 'Hoodie em algodão supima de 180g com corte clássico ligeiramente relaxado.',                          details: '100% Algodão Supima | 180g/m² | Corte clássico | Gola reforçada',                                       images: ['roupa/essentials_hoodie_1.png',        'roupa/essentials_hoodie_2.png',        'roupa/essentials_hoodie_3.png'] },
        7:   { name: 'Off-white Sweater',                      price: '79.99€',  description: 'Fato completo em lã super 120s, corte clássico italiano com dois botões.',                            details: '100% Lã Super 120s | Corte italiano dois botões | Forro em seda | Fabricado em Itália',                 images: ['roupa/offwhite_sweat_1.png',           'roupa/offwhite_sweat_2.png',           'roupa/offwhite_sweat_3.png'] },
        8:   { name: 'Ralph Lauren Quarter Zip',               price: '89.99€',  description: 'Trench coat clássico em gabardine de algodão com forro removível.',                                   details: '100% Gabardine de Algodão | Forro removível | Cintura ajustável | Fabricado em Inglaterra',             images: ['roupa/ralph_lauren_1.png',             'roupa/ralph_lauren_2.png',             'roupa/ralph_lauren_3.png'] },
        9:   { name: 'Stone Island Denim Jacket',              price: '99.99€',  description: 'Polo em piqué de algodão mercerizado, corte slim com detalhe no colarinho.',                          details: '100% Algodão Mercerizado Piqué | Corte slim | Colarinho em ponto de arroz | Fabricado em Portugal',     images: ['roupa/stone_island_jacket_1.png',      'roupa/stone_island_jacket_2.png',      'roupa/stone_island_jacket_3.png'] },
        10:  { name: 'Stone Island Jeans',                     price: '69.99€',  description: 'Jaqueta em couro de novilho italiano com forro em seda e hardware em latão.',                         details: '100% Couro de Novilho Italiano | Forro em seda | Hardware em latão | Fabricado em Itália',              images: ['roupa/stone_island_jeans_1.png',       'roupa/stone_island_jeans_2.png',       'roupa/stone_island_jeans_3.png'] },
        11:  { name: 'Supreme NYC Crewneck Sweat',             price: '89.99€',  description: 'Camisa slim fit em algodão popelina com colarinho italiano e botões acetinados.',                     details: '100% Algodão Popelina | Corte slim fit | Colarinho italiano | Botões acetinados pretos',                images: ['roupa/supreme_nyc_sweat_1.png',        'roupa/supreme_nyc_sweat_2.png',        'roupa/supreme_nyc_sweat_3.png'] },
        12:  { name: 'Travis Scott Retro T-Shirt',             price: '59.99€',  description: 'Colete formal de cinco botões em lã merino com forro em cetim.',                                      details: '100% Lã Merino | Forro em cetim | Costas ajustáveis | Cinco botões | Fabricado em Itália',              images: ['roupa/travis_tshirt_1.png',            'roupa/travis_tshirt_2.png',            'roupa/travis_tshirt_3.png'] },

        101: { name: 'Air Jordan 4 Fear',                      price: '130.00€', description: 'Sapato Oxford em couro de vitela italiano com acabamento à mão e sola Goodyear Welt.',               details: 'Couro de Vitela Italiano | Sola Goodyear Welt | Acabamento à mão | Palmilha em couro',                  images: ['shoes/air_jordan_4_1.png',             'shoes/air_jordan_4_2.png',             'shoes/air_jordan_4_3.png'] },
        102: { name: 'Air Jordan 11 retro Cool Grey',          price: '120.00€', description: 'Sapato Derby em couro castanho genuíno de primeira qualidade.',                                       details: 'Couro Castanho Genuíno | Sola em couro | Palmilha acolchoada | Fabricado em Portugal',                  images: ['shoes/air_jordan_11_1.png',            'shoes/air_jordan_11_2.png',            'shoes/air_jordan_11_3.png'] },
        103: { name: 'Jordan x Travis Scott Air Jordan 1 Low', price: '130.00€', description: 'Loafer elegante em couro nobuck cinzento para ambientes formais e informais.',                        details: 'Couro Nobuck Cinzento | Sola em borracha | Palmilha em couro | Fabricado em Itália',                    images: ['shoes/jordan_travis_scott_1.png',      'shoes/jordan_travis_scott_2.png',      'shoes/jordan_travis_scott_3.png'] },
        104: { name: 'LV Footprint Soccer',                    price: '140.00€', description: 'Sneaker contemporâneo em couro branco com sola em borracha. Design limpo e versátil.',               details: 'Couro Branco Premium | Sola em borracha | Palmilha acolchoada | Design minimalista',                    images: ['shoes/lv_footprint_1.png',             'shoes/lv_footprint_2.png',             'shoes/lv_footprint_3.png'] },
        105: { name: 'LV X Timberland Boot',                   price: '140.00€', description: 'Bota Chelsea em couro italiano preto com forro genuíno e sola Goodyear Welt.',                       details: 'Couro Italiano Negro | Sola Goodyear Welt | Forro em couro | Elástico lateral reforçado',               images: ['shoes/lv_timberland_boot_1.png',       'shoes/lv_timberland_boot_2.png',       'shoes/lv_timberland_boot_3.png'] },
        106: { name: 'Nike Air Max 95 BH Corteiz',             price: '130.00€', description: 'Mocassim tradicional em couro castanho com acabamentos perfeitos.',                                   details: 'Couro Castanho Genuíno | Costura mocassim à mão | Sola em borracha | Palmilha em couro',                images: ['shoes/nike_air_max_95_Corteiz_1.png',  'shoes/nike_air_max_95_Corteiz_2.png',  'shoes/nike_air_max_95_Corteiz_3.png'] },
        107: { name: 'Nike Hot Step 2',                        price: '140.00€', description: 'Sapato Monkstrap em couro preto com elegância moderna e toque minimalista.',                          details: 'Couro Negro Genuíno | Fecho monkstrap em metal dourado | Sola em couro | Fabricado em Espanha',         images: ['shoes/nike_hot_step_2_1.png',          'shoes/nike_hot_step_2_2.png',          'shoes/nike_hot_step_2_3.png'] },
        108: { name: 'Yeezy Foam Runner',                      price: '120.00€', description: 'Bota Desert em couro castanho premium com sola Crepe e construção handcrafted.',                     details: 'Couro Castanho Premium | Sola Crepe | Construção handcrafted | Fabricado em Inglaterra',                 images: ['shoes/yeezy_foamrunner_1.png',         'shoes/yeezy_foamrunner_2.png',         'shoes/yeezy_foamrunner_3.png'] }
    },

    init: function() {
        var id = new URLSearchParams(window.location.search).get('id');
        if (id && this.products[id]) this.loadProduct(id);
    },

    loadProduct: function(id) {
        var p = this.products[id];
        if (!p) return;

        var set = function(elId, val) { var el = document.getElementById(elId); if (el) el.textContent = val; };
        set('productTitle',       p.name);
        set('productPrice',       p.price);
        set('productDescription', p.description);
        set('productDetails',     p.details || '');
        set('breadcrumbProduct',  p.name);

        var mainImg = document.getElementById('mainImage');
        if (mainImg && p.images[0]) mainImg.src = p.images[0];
        document.title = p.name + ' | NOIR';

        var gallery = document.getElementById('productGallery');
        if (gallery) {
            gallery.innerHTML = p.images.map(function(src, i) {
                return '<div class="gallery-thumbnail ' + (i === 0 ? 'active' : '') + '" data-index="' + i + '">' +
                    '<img src="' + src + '" alt="' + p.name + ' ' + (i+1) + '">' +
                '</div>';
            }).join('');
        }

        var sz = document.getElementById('sizeSelector');
        if (sz) {
            var isShoe = parseInt(id) >= 100;
            var sizes  = isShoe ? [38,39,40,41,42,43,44] : ['S','M','L','XL'];
            sz.innerHTML = sizes.map(function(s) {
                return '<button class="size-option" data-size="' + s + '">' + s + '</button>';
            }).join('');
        }

        var related = document.getElementById('relatedProducts');
        if (related) {
            var others = Object.keys(this.products).filter(function(k) { return k !== id; }).slice(0, 4);
            var self   = this;
            related.innerHTML = others.map(function(kid) {
                var kp = self.products[kid];
                return '<article class="product-card reveal">' +
                    '<a href="produto.html?id=' + kid + '" class="product-image-link">' +
                        '<div class="product-image"><img src="' + kp.images[0] + '" alt="' + kp.name + '">' +
                        '<div class="product-overlay"><span>Ver Detalhes</span></div></div></a>' +
                    '<div class="product-info"><h3 class="product-name">' + kp.name + '</h3><p class="product-price">' + kp.price + '</p></div>' +
                '</article>';
            }).join('');
            related.querySelectorAll('.reveal').forEach(function(el) { setTimeout(function() { el.classList.add('visible'); }, 100); });
        }
    }
};

// ==========================================
// Banner promocional
// ==========================================
var Banner = {
    init: function() {
        if (document.getElementById('_promoBanner')) return;

        var banner = document.createElement('div');
        banner.id  = '_promoBanner';
        banner.style.cssText = 'background:#000;color:#fff;text-align:center;padding:10px 48px;font-family:Montserrat,sans-serif;font-size:0.72rem;letter-spacing:0.2em;text-transform:uppercase;position:fixed;top:0;left:0;right:0;z-index:10000;width:100%;box-sizing:border-box;';
        banner.innerHTML =
            'Portes gr\u00e1tis em compras acima de \u20ac150 \u00a0|\u00a0 Devolu\u00e7\u00f5es gratuitas at\u00e9 30 dias' +
            '<button id="_bannerClose" style="position:absolute;right:14px;top:50%;transform:translateY(-50%);background:none;border:none;color:#fff;cursor:pointer;font-size:1.1rem;line-height:1;padding:4px;" aria-label="Fechar">\u00d7</button>';

        var body = document.body;
        body.insertBefore(banner, body.firstChild);

        // Esperar o banner renderizar para medir a altura
        setTimeout(function() {
            var h = banner.offsetHeight;
            var header = document.getElementById('header');
            if (header) {
                header.style.top = h + 'px';
                header.style.transition = 'top 0.3s ease';
            }
            body.style.paddingTop = h + 'px';
        }, 10);

        document.getElementById('_bannerClose').addEventListener('click', function() {
            var header = document.getElementById('header');
            banner.style.transition = 'opacity 0.3s ease';
            banner.style.opacity = '0';
            setTimeout(function() {
                banner.remove();
                if (header) { header.style.top = '0'; }
                body.style.paddingTop = '0';
            }, 300);
        });
    }
};

// ==========================================
// Wishlist (Favoritos)
// ==========================================
var Wishlist = {
    items: [],

    init: function() {
        this.items = JSON.parse(localStorage.getItem('noirWishlist') || '[]');

        // Injectar estilos
        if (!document.getElementById('_wishStyles')) {
            var s = document.createElement('style');
            s.id  = '_wishStyles';
            s.textContent =
                '@keyframes _wIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}' +
                '@keyframes _wOut{from{opacity:1}to{opacity:0}}' +
                '@keyframes _wSlide{from{transform:translateX(60px);opacity:0}to{transform:translateX(0);opacity:1}}' +
                '._wishPanel{background:#fff;width:420px;max-width:95vw;height:100%;overflow-y:auto;padding:40px;animation:_wSlide 0.4s cubic-bezier(.16,1,.3,1);}' +
                '._wishItem{display:flex;gap:16px;padding:16px 0;border-bottom:1px solid #e8e8e8;align-items:center;}' +
                '._wishItem img{width:72px;height:72px;object-fit:contain;background:#f8f8f8;flex-shrink:0;}' +
                '._wishItem-info{flex:1;}' +
                '._wishItem-name{font-size:.85rem;font-family:"Cormorant Garamond",serif;margin:0 0 4px;}' +
                '._wishItem-price{font-size:.75rem;color:#707070;margin:0;}' +
                '._wishRemove{background:none;border:none;cursor:pointer;font-size:.7rem;letter-spacing:.1em;text-transform:uppercase;color:#a0a0a0;padding:0;margin-top:6px;display:block;}' +
                '._wishRemove:hover{color:#000;}';
            document.head.appendChild(s);
        }

        // Injectar ícone de coração no header
        Wishlist.injectHeaderIcon();

        // Coraçõezinhos nos cards da grelha
        document.querySelectorAll('.product-card').forEach(function(card) {
            var pid = card.dataset.productId;
            if (!pid) return;
            var imgDiv = card.querySelector('.product-image');
            if (!imgDiv) return;
            imgDiv.style.position = 'relative';

            var heart = document.createElement('button');
            heart.className = 'btn-wishlist';
            heart.setAttribute('aria-label', 'Favoritos');
            heart.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>';
            if (Wishlist.items.indexOf(pid) !== -1) heart.classList.add('active');
            heart.addEventListener('click', function(e) {
                e.preventDefault(); e.stopPropagation();
                Wishlist.toggle(pid, heart);
            });
            imgDiv.appendChild(heart);
        });

        // Botão na página de produto
        var btn = document.getElementById('wishlistBtn');
        if (btn) {
            var pid = new URLSearchParams(window.location.search).get('id');
            if (pid && Wishlist.items.indexOf(pid) !== -1) btn.classList.add('active');
            btn.addEventListener('click', function() { Wishlist.toggle(pid, btn); });
        }
    },

    injectHeaderIcon: function() {
        if (document.getElementById('wishlistHeaderBtn')) return;
        var navActions = document.querySelector('.nav-actions');
        if (!navActions) return;

        var btn = document.createElement('button');
        btn.id  = 'wishlistHeaderBtn';
        btn.setAttribute('aria-label', 'Favoritos');
        btn.style.cssText = 'background:none;border:none;cursor:pointer;padding:4px;display:inline-flex;align-items:center;justify-content:center;color:inherit;position:relative;';
        btn.innerHTML =
            '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>' +
            '<span id="_wishCount" style="position:absolute;top:-4px;right:-4px;background:#000;color:#fff;border-radius:50%;width:16px;height:16px;font-size:9px;display:flex;align-items:center;justify-content:center;font-family:Montserrat,sans-serif;"></span>';

        btn.addEventListener('click', function() { Wishlist.openPanel(); });

        var cartBtn = document.getElementById('cartBtn');
        if (cartBtn) navActions.insertBefore(btn, cartBtn);
        else navActions.appendChild(btn);

        Wishlist.updateCount();
    },

    updateCount: function() {
        var el = document.getElementById('_wishCount');
        if (!el) return;
        el.textContent = Wishlist.items.length > 0 ? Wishlist.items.length : '';
        el.style.display = Wishlist.items.length > 0 ? 'flex' : 'none';
    },

    openPanel: function() {
        if (document.getElementById('_wishOverlay')) return;

        var overlay = document.createElement('div');
        overlay.id  = '_wishOverlay';
        overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:9998;display:flex;align-items:stretch;justify-content:flex-end;animation:_nFade 0.3s ease;';

        var panel = document.createElement('div');
        panel.className = '_wishPanel';

        // Header
        panel.innerHTML =
            '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:32px;">' +
                '<h2 style="font-family:\'Cormorant Garamond\',serif;font-size:1.7rem;font-weight:400;letter-spacing:.06em;margin:0;">Favoritos</h2>' +
                '<button id="_wishClose" style="background:none;border:none;cursor:pointer;padding:4px;">' +
                    '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="1.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>' +
                '</button>' +
            '</div>' +
            '<div id="_wishList"></div>';

        overlay.appendChild(panel);
        document.body.appendChild(overlay);
        document.body.style.overflow = 'hidden';

        Wishlist.renderPanel();

        document.getElementById('_wishClose').addEventListener('click', function() {
            overlay.remove(); document.body.style.overflow = '';
        });
        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) { overlay.remove(); document.body.style.overflow = ''; }
        });
    },

    renderPanel: function() {
        var list = document.getElementById('_wishList');
        if (!list) return;

        if (Wishlist.items.length === 0) {
            list.innerHTML = '<p style="font-size:.85rem;color:#a0a0a0;font-style:italic;">Ainda n\u00e3o tens favoritos guardados.</p>';
            return;
        }

        var html = '';
        Wishlist.items.forEach(function(pid) {
            var p = ProductData.products[pid];
            if (!p) return;
            html += '<div class="_wishItem">' +
                '<img src="' + p.images[0] + '" alt="' + p.name + '">' +
                '<div class="_wishItem-info">' +
                    '<p class="_wishItem-name">' + p.name + '</p>' +
                    '<p class="_wishItem-price">' + p.price + '</p>' +
                    '<a href="produto.html?id=' + pid + '" style="font-size:.7rem;letter-spacing:.1em;text-transform:uppercase;color:#000;text-decoration:none;display:inline-block;margin-top:6px;border-bottom:1px solid #000;">Ver produto</a>' +
                    '<button class="_wishRemove" onclick="Wishlist.removeFromPanel(\'' + pid + '\')">Remover</button>' +
                '</div>' +
            '</div>';
        });
        list.innerHTML = html;
    },

    removeFromPanel: function(pid) {
        var idx = Wishlist.items.indexOf(pid);
        if (idx !== -1) Wishlist.items.splice(idx, 1);
        localStorage.setItem('noirWishlist', JSON.stringify(Wishlist.items));
        Wishlist.updateCount();
        Wishlist.renderPanel();
        // Atualizar coraçõezinhos na grelha
        document.querySelectorAll('.product-card[data-product-id="' + pid + '"] .btn-wishlist').forEach(function(b) { b.classList.remove('active'); });
    },

    toggle: function(pid, btn) {
        if (!pid) return;
        var idx = Wishlist.items.indexOf(pid);
        if (idx === -1) {
            Wishlist.items.push(pid);
            if (btn) btn.classList.add('active');
            Wishlist.showToast('Adicionado aos favoritos \u2665');
        } else {
            Wishlist.items.splice(idx, 1);
            if (btn) btn.classList.remove('active');
            Wishlist.showToast('Removido dos favoritos');
        }
        localStorage.setItem('noirWishlist', JSON.stringify(Wishlist.items));
        Wishlist.updateCount();
    },

    showToast: function(msg) {
        var existing = document.getElementById('_wishToast');
        if (existing) existing.remove();
        var toast = document.createElement('div');
        toast.id   = '_wishToast';
        toast.style.cssText = 'position:fixed;bottom:32px;left:50%;transform:translateX(-50%);background:#000;color:#fff;padding:12px 24px;font-family:Montserrat,sans-serif;font-size:0.78rem;letter-spacing:0.1em;z-index:9999;animation:_wIn 0.3s ease;white-space:nowrap;';
        toast.textContent = msg;
        document.body.appendChild(toast);
        setTimeout(function() {
            toast.style.animation = '_wOut 0.3s ease forwards';
            setTimeout(function() { toast.remove(); }, 300);
        }, 2200);
    }
};

// ==========================================
// Reviews (Avaliações) - Firebase Firestore
// ==========================================
var Reviews = {
    db: null,
    productId: null,
    selectedStars: 0,

    init: function() {
        var grid      = document.getElementById('reviewsGrid');
        var submitBtn = document.getElementById('submitReview');
        if (!grid && !submitBtn) return;

        Reviews.productId = new URLSearchParams(window.location.search).get('id');
        if (!Reviews.productId) return;

        // Não chamar renderForm aqui - o onAuthStateChanged trata disso
        // depois de saber se o utilizador está logado ou não

        // Injectar estilos das estrelas com meias estrelas
        if (!document.getElementById('_revStyles')) {
            var s = document.createElement('style');
            s.id  = '_revStyles';
            s.textContent =
                '.star-wrap{display:inline-block;position:relative;font-size:1.6rem;cursor:pointer;color:#d0d0d0;margin-right:2px;}' +
                '.star-wrap .star-full{position:absolute;left:0;top:0;width:100%;overflow:hidden;color:#000;white-space:nowrap;pointer-events:none;transition:width .1s;}' +
                '.review-stars-disp{color:#000;font-size:1rem;letter-spacing:2px;}' +
                '#starsInput{display:flex;margin-bottom:16px;gap:0;}' +
                '._rev-login-hint{background:#f8f8f8;padding:14px 18px;font-size:.8rem;color:#505050;margin-bottom:20px;line-height:1.7;}' +
                '._rev-login-hint a{color:#000;font-weight:600;}' +
                '.review-card{background:#f8f8f8;padding:24px;position:relative;}' +
                '._rev-del{position:absolute;top:12px;right:12px;background:none;border:none;cursor:pointer;font-size:.7rem;letter-spacing:.08em;text-transform:uppercase;color:#a0a0a0;}' +
                '._rev-del:hover{color:#c00;}';
            document.head.appendChild(s);
        }

        // Inicializar Firestore
        if (typeof firebase !== 'undefined' && firebase.apps.length) {
            try {
                Reviews.db = firebase.firestore();
            } catch(e) { console.warn('Firestore não disponível:', e); }
        }

        // renderForm é chamado pelo onAuthStateChanged no Auth
        // Se já houver estado (ex: página recarregada), chamar agora
        if (typeof Auth !== 'undefined') {
            Reviews.renderForm();
        }
        Reviews.loadReviews();
    },

    renderForm: function() {
        var formArea = document.getElementById('reviewFormArea');
        if (!formArea) return;

        var user = Auth.currentUser;

        if (!user) {
            formArea.innerHTML =
                '<div class="_rev-login-hint">' +
                    '\u2139\ufe0f Para deixar uma avalia\u00e7\u00e3o tens de ter uma conta.<br>' +
                    '<a href="#" id="_revLoginLink">Inicia sess\u00e3o</a> ou <a href="#" id="_revRegLink">cria uma conta</a> \u2014 \u00e9 gr\u00e1tis!' +
                '</div>';
            document.getElementById('_revLoginLink').addEventListener('click', function(e) {
                e.preventDefault(); Auth.openPanel();
            });
            document.getElementById('_revRegLink').addEventListener('click', function(e) {
                e.preventDefault(); Auth.openPanel();
            });
            return;
        }

        formArea.innerHTML =
            '<div id="starsInput" style="margin-bottom:16px;"></div>' +
            '<p id="_starHint" style="font-size:.72rem;color:#a0a0a0;margin:-8px 0 14px;letter-spacing:.05em;">Clica para selecionar a nota</p>' +
            '<textarea id="reviewText" style="width:100%;padding:12px 14px;border:1px solid #d0d0d0;font-family:Montserrat,sans-serif;font-size:.82rem;box-sizing:border-box;outline:none;height:100px;resize:vertical;margin-bottom:12px;" placeholder="A sua opini\u00e3o sobre o produto..."></textarea>' +
            '<button id="submitReview" style="background:#000;color:#fff;border:none;padding:14px 32px;font-size:.75rem;font-weight:500;letter-spacing:.15em;text-transform:uppercase;cursor:pointer;font-family:Montserrat,sans-serif;">Publicar Avalia\u00e7\u00e3o</button>' +
            '<p id="reviewMsg" style="font-size:.78rem;color:#080;margin-top:10px;display:none;">Avalia\u00e7\u00e3o publicada! Obrigado.</p>';

        Reviews.buildStarInput();

        document.getElementById('submitReview').addEventListener('click', function() {
            Reviews.submit();
        });
    },

    buildStarInput: function() {
        var container = document.getElementById('starsInput');
        if (!container) return;
        container.innerHTML = '';
        Reviews.selectedStars = 0;

        for (var i = 1; i <= 5; i++) {
            // Cada estrela tem dois alvos clicáveis: metade esquerda (0.5) e direita (1.0)
            var wrap = document.createElement('span');
            wrap.className    = 'star-wrap';
            wrap.dataset.star = i;
            wrap.style.cssText = 'display:inline-block;position:relative;font-size:1.8rem;cursor:pointer;color:#d0d0d0;margin-right:1px;user-select:none;';
            wrap.innerHTML =
                // Fundo cinzento
                '\u2605' +
                // Metade esquerda (meia estrela)
                '<span class="star-half-l" style="position:absolute;left:0;top:0;width:50%;height:100%;overflow:hidden;color:#000;pointer-events:none;">\u2605</span>' +
                // Metade direita (estrela cheia)
                '<span class="star-half-r" style="position:absolute;left:0;top:0;width:0%;height:100%;overflow:hidden;color:#000;pointer-events:none;">\u2605</span>';

            (function(starNum, w) {
                w.addEventListener('mousemove', function(e) {
                    var rect = w.getBoundingClientRect();
                    var half = (e.clientX - rect.left) < rect.width / 2;
                    Reviews.highlightStars(half ? starNum - 0.5 : starNum);
                });
                w.addEventListener('mouseleave', function() {
                    Reviews.highlightStars(Reviews.selectedStars);
                });
                w.addEventListener('click', function(e) {
                    var rect = w.getBoundingClientRect();
                    var half = (e.clientX - rect.left) < rect.width / 2;
                    Reviews.selectedStars = half ? starNum - 0.5 : starNum;
                    Reviews.highlightStars(Reviews.selectedStars);
                    var hint = document.getElementById('_starHint');
                    if (hint) {
                        var s = Reviews.selectedStars;
                        hint.textContent = s + ' estrela' + (s !== 1 ? 's' : '');
                        hint.style.color = '#000';
                    }
                });
            })(i, wrap);

            container.appendChild(wrap);
        }
    },

    highlightStars: function(value) {
        var wraps = document.querySelectorAll('#starsInput .star-wrap');
        wraps.forEach(function(w, i) {
            var starNum = i + 1;
            var halfL = w.querySelector('.star-half-l');
            var halfR = w.querySelector('.star-half-r');
            if (!halfL || !halfR) {
                // fallback para estrutura antiga
                var full = w.querySelector('.star-full');
                if (full) {
                    if (value >= starNum)            full.style.width = '100%';
                    else if (value >= starNum - 0.5) full.style.width = '50%';
                    else                             full.style.width = '0%';
                }
                return;
            }
            if (value >= starNum) {
                halfL.style.width = '50%';
                halfR.style.width = '100%';
            } else if (value >= starNum - 0.5) {
                halfL.style.width = '50%';
                halfR.style.width = '0%';
            } else {
                halfL.style.width = '0%';
                halfR.style.width = '0%';
            }
        });
    },

    starsHtml: function(value) {
        var html = '';
        for (var i = 1; i <= 5; i++) {
            if (value >= i) {
                html += '<span style="color:#000;font-size:1rem;">\u2605</span>';
            } else if (value >= i - 0.5) {
                html += '<span style="position:relative;display:inline-block;font-size:1rem;color:#d0d0d0;">\u2605<span style="position:absolute;left:0;top:0;overflow:hidden;width:50%;color:#000;">\u2605</span></span>';
            } else {
                html += '<span style="color:#d0d0d0;font-size:1rem;">\u2605</span>';
            }
        }
        return html;
    },

    submit: function() {
        var user  = Auth.currentUser;
        var texto = document.getElementById('reviewText') ? document.getElementById('reviewText').value.trim() : '';

        if (!user)  { alert('Tens de iniciar sess\u00e3o para publicar.'); return; }
        if (!texto) { alert('Escreve a tua opini\u00e3o.'); return; }
        if (Reviews.selectedStars === 0) { alert('Seleciona pelo menos meia estrela.'); return; }

        var profile = Auth.getProfile();
        var nome    = profile.nome || user.email.split('@')[0];

        var review = {
            productId: Reviews.productId,
            uid:       user.uid,
            nome:      nome,
            email:     user.email,
            texto:     texto,
            stars:     Reviews.selectedStars,
            data:      new Date().toLocaleDateString('pt-PT'),
            timestamp: Date.now()
        };

        // Guardar no Firestore (permanente) ou localStorage (fallback)
        if (Reviews.db) {
            Reviews.db.collection('reviews').add(review)
                .then(function() { Reviews.afterSubmit(); Reviews.loadReviews(); })
                .catch(function(err) { console.error(err); Reviews.saveLocal(review); Reviews.afterSubmit(); });
        } else {
            Reviews.saveLocal(review);
            Reviews.afterSubmit();
        }
    },

    saveLocal: function(review) {
        var key  = 'noirReviews_' + Reviews.productId;
        var list = JSON.parse(localStorage.getItem(key) || '[]');
        list.unshift(review);
        localStorage.setItem(key, JSON.stringify(list));
        Reviews.renderLocal(list);
    },

    afterSubmit: function() {
        var msg = document.getElementById('reviewMsg');
        if (document.getElementById('reviewText')) document.getElementById('reviewText').value = '';
        Reviews.selectedStars = 0;
        Reviews.highlightStars(0);
        var hint = document.getElementById('_starHint');
        if (hint) hint.textContent = 'Clica para selecionar a nota';
        if (msg) { msg.style.display = 'block'; setTimeout(function() { msg.style.display = 'none'; }, 3000); }
    },

    loadReviews: function() {
        var grid = document.getElementById('reviewsGrid');
        if (!grid) return;

        if (Reviews.db) {
            Reviews.db.collection('reviews')
                .where('productId', '==', Reviews.productId)
                .get()
                .then(function(snap) {
                    var list = [];
                    snap.forEach(function(doc) { list.push({ id: doc.id, data: doc.data() }); });
                    // Ordenar por timestamp no cliente (sem precisar de índice composto)
                    list.sort(function(a, b) { return (b.data.timestamp || 0) - (a.data.timestamp || 0); });
                    Reviews.renderFirestore(list, grid);
                })
                .catch(function(err) {
                    console.warn('Firestore read error:', err);
                    var key  = 'noirReviews_' + Reviews.productId;
                    Reviews.renderLocal(JSON.parse(localStorage.getItem(key) || '[]'));
                });
        } else {
            var key  = 'noirReviews_' + Reviews.productId;
            Reviews.renderLocal(JSON.parse(localStorage.getItem(key) || '[]'));
        }
    },

    renderFirestore: function(list, grid) {
        var noRev = document.getElementById('noReviews');
        if (list.length === 0) {
            if (noRev) noRev.style.display = 'block';
            grid.innerHTML = '';
            return;
        }
        if (noRev) noRev.style.display = 'none';

        var user = Auth.currentUser;
        var html = '';
        list.forEach(function(item) {
            var r   = item.data;
            var id  = item.id;
            var canDelete = user && (user.uid === r.uid);
            html += '<div class="review-card">' +
                (canDelete ? '<button class="_rev-del" onclick="Reviews.deleteReview(\'' + id + '\')">Eliminar</button>' : '') +
                '<div class="review-stars">' + Reviews.starsHtml(r.stars) + '</div>' +
                '<p class="review-text" style="font-size:.85rem;color:#505050;line-height:1.7;margin:8px 0 12px;">' + r.texto + '</p>' +
                '<p class="review-author" style="font-size:.72rem;letter-spacing:.1em;text-transform:uppercase;color:#a0a0a0;">' + r.nome + ' \u2014 ' + r.data + '</p>' +
            '</div>';
        });
        grid.innerHTML = html;
    },

    renderLocal: function(list) {
        var grid  = document.getElementById('reviewsGrid');
        var noRev = document.getElementById('noReviews');
        if (!grid) return;
        if (list.length === 0) { if (noRev) noRev.style.display = 'block'; return; }
        if (noRev) noRev.style.display = 'none';

        var html = '';
        list.forEach(function(r) {
            html += '<div class="review-card">' +
                '<div class="review-stars">' + Reviews.starsHtml(r.stars) + '</div>' +
                '<p class="review-text" style="font-size:.85rem;color:#505050;line-height:1.7;margin:8px 0 12px;">' + r.texto + '</p>' +
                '<p class="review-author" style="font-size:.72rem;letter-spacing:.1em;text-transform:uppercase;color:#a0a0a0;">' + r.nome + ' \u2014 ' + r.data + '</p>' +
            '</div>';
        });
        grid.innerHTML = html;
    },

    deleteReview: function(docId) {
        if (!Reviews.db) return;
        if (!confirm('Tens a certeza que queres eliminar esta avalia\u00e7\u00e3o?')) return;
        Reviews.db.collection('reviews').doc(docId).delete()
            .then(function() { Reviews.loadReviews(); });
    }
};

// ==========================================
// Newsletter
// ==========================================
var Newsletter = {
    init: function() {
        var form  = document.querySelector('.newsletter-form');
        if (!form) return;

        // Dar id aos elementos se não tiverem
        var input = form.querySelector('input[type="email"]');
        var btn   = form.querySelector('button');
        if (input) input.id = '_nlEmail';
        if (btn)   btn.id   = '_nlBtn';

        form.addEventListener('submit', function(e) {
            e.preventDefault();
            Newsletter.subscribe();
        });

        if (btn) btn.addEventListener('click', function(e) {
            e.preventDefault();
            Newsletter.subscribe();
        });
    },

    subscribe: function() {
        var input = document.getElementById('_nlEmail');
        if (!input) return;

        var email = input.value.trim();
        if (!email || email.indexOf('@') === -1) {
            Newsletter.showMsg('Por favor introduz um email válido.', false);
            return;
        }

        var btn = document.getElementById('_nlBtn');
        if (btn) { btn.textContent = 'A enviar...'; btn.disabled = true; }

        fetch(SHEETS_URL, {
            method: 'POST',
            body: JSON.stringify({ type: 'newsletter', email: email })
        })
        .then(function(r) { return r.json(); })
        .then(function(data) {
            if (data.duplicate) {
                Newsletter.showMsg('Este email já está subscrito! ✓', true);
            } else {
                Newsletter.showMsg('Subscrito com sucesso! Verifica o teu email. ✦', true);
                input.value = '';
            }
            if (btn) { btn.textContent = 'Notifique-me!'; btn.disabled = false; }
        })
        .catch(function() {
            Newsletter.showMsg('Subscrito! Obrigado. ✦', true);
            input.value = '';
            if (btn) { btn.textContent = 'Notifique-me!'; btn.disabled = false; }
        });
    },

    showMsg: function(text, success) {
        var existing = document.getElementById('_nlMsg');
        if (existing) existing.remove();

        var msg = document.createElement('p');
        msg.id  = '_nlMsg';
        msg.textContent = text;
        msg.style.cssText = 'font-size:.78rem;letter-spacing:.08em;margin-top:14px;' +
            (success ? 'color:#4caf50;' : 'color:#f44336;');

        var form = document.querySelector('.newsletter-form');
        if (form && form.parentNode) form.parentNode.insertBefore(msg, form.nextSibling);

        setTimeout(function() {
            var el = document.getElementById('_nlMsg');
            if (el) el.remove();
        }, 5000);
    }
};