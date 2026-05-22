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
var SHEETS_URL = 'https://script.google.com/macros/s/AKfycbyOCU4ZZ14R2tmdbKCm5BKTwPAVWiNKe0R5FsLq9jDB4wLI-Pu3Z45BhXh2dackc8E5/exec';

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

            var payload = {
                nome: nome, email: email, telemovel: tel,
                pais: pais, codigoPostal: cp, cidade: cidade,
                morada: morada, itens: itensList, total: totalStr
            };

            fetch(SHEETS_URL, { method: 'POST', body: JSON.stringify(payload) })
                .then(function()  { Cart._showConfirmation(nome, totalStr); })
                .catch(function() { Cart._showConfirmation(nome, totalStr); });
        });
    },

    _showConfirmation: function(nome, totalStr) {
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
