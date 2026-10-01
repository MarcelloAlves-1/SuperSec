import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './style.css';

const API = 'http://localhost:8080/api';

const Icon = ({ name, size = 20 }) => {
  const paths = {
    search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></>,
    cart: <><circle cx="9" cy="19" r="1"/><circle cx="18" cy="19" r="1"/><path d="M3 4h2l2.2 10.2a2 2 0 0 0 2 1.6h7.9a2 2 0 0 0 1.9-1.4L21 8H6"/></>,
    user: <><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></>,
    orders: <><path d="M6 3h12v18H6z"/><path d="M9 7h6M9 11h6M9 15h4"/></>,
    logout: <><path d="M10 17l5-5-5-5"/><path d="M15 12H3"/><path d="M21 3v18h-6"/></>,
    plus: <><path d="M12 5v14M5 12h14"/></>,
    minus: <path d="M5 12h14"/>,
    trash: <><path d="M4 7h16M9 7V4h6v3M7 7l1 14h8l1-14M10 11v6M14 11v6"/></>,
    arrow: <><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></>,
    check: <path d="m5 12 4 4L19 6"/>,
    close: <><path d="M6 6l12 12M18 6 6 18"/></>,
    package: <><path d="m12 3 8 4.5v9L12 21l-8-4.5v-9z"/><path d="M4 7.5 12 12l8-4.5M12 12v9"/></>,
    shield: <><path d="M12 3 20 6v5c0 5-3.3 8.5-8 10-4.7-1.5-8-5-8-10V6z"/><path d="m9 12 2 2 4-4"/></>,
    menu: <><path d="M4 6h16M4 12h16M4 18h16"/></>,
    chevron: <path d="m7 10 5 5 5-5"/>,
    edit: <><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z"/></>,
    refresh: <><path d="M20 11a8 8 0 1 0 2 5"/><path d="M20 4v7h-7"/></>,
    power: <><path d="M12 2v10"/><path d="M18.4 6.6a8 8 0 1 1-12.8 0"/></>
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
};

const money = value => `R$ ${Number(value || 0).toFixed(2).replace('.', ',')}`;
const readStorage = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); } catch { return fallback; }
};

function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState(readStorage('cart', []));
  const [user, setUser] = useState(readStorage('user', null));
  const [view, setView] = useState('home');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('featured');
  const [authMode, setAuthMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [orders, setOrders] = useState([]);
  const [loadingAccount, setLoadingAccount] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState(null);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [confirmCheckout, setConfirmCheckout] = useState(false);
  const [orderCompleted, setOrderCompleted] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [adminProducts, setAdminProducts] = useState([]);
  const [loadingAdmin, setLoadingAdmin] = useState(false);
  const [adminForm, setAdminForm] = useState({ id: null, name: '', description: '', price: '', stock: '', imageUrl: '', active: true });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    if (!products.length) return;
    setCart(items => items
      .map(item => {
        const fresh = products.find(product => product.id === item.id);
        return fresh ? { ...item, stock: fresh.stock, price: fresh.price, imageUrl: fresh.imageUrl } : null;
      })
      .filter(Boolean)
      .map(item => ({ ...item, qty: Math.min(item.qty, Math.max(0, Number(item.stock) || 0)) }))
      .filter(item => item.qty > 0)
    );
  }, [products]);

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(null), 3800);
    return () => clearTimeout(timer);
  }, [notice]);

  const notify = (message, type = 'success') => setNotice({ message, type });

  const loadProducts = async () => {
    setLoadingProducts(true);
    try {
      setProducts(await request('/products/public'));
    } catch (error) {
      notify(error.message, 'error');
    } finally {
      setLoadingProducts(false);
    }
  };

  const request = async (path, options = {}) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);
    try {
      const response = await fetch(API + path, { ...options, signal: controller.signal });
      const raw = await response.text();
      let data = null;
      try { data = raw ? JSON.parse(raw) : null; } catch { data = null; }
      if (response.status === 401) {
        if (path !== '/auth/login' && path !== '/auth/register') {
          setUser(null);
          localStorage.removeItem('user');
          setView('auth');
        }
        throw new Error('Sua sessão expirou. Entre novamente para continuar.');
      }
      if (response.status === 403) throw new Error(data?.message || 'Você não tem permissão para realizar esta ação.');
      if (!response.ok) throw new Error(data?.message || data?.error || raw || 'Ocorreu um erro.');
      return data;
    } catch (error) {
      if (error.name === 'AbortError') throw new Error('O servidor demorou para responder. Verifique se o Docker está ativo e tente novamente.');
      if (error instanceof TypeError) throw new Error('Não foi possível conectar ao servidor. Verifique se o backend está ativo.');
      throw error;
    } finally {
      clearTimeout(timeout);
    }
  };

  const auth = async (path, body) => request(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  const login = async event => {
    event.preventDefault();
    if (!email || !password) return notify('Preencha e-mail e senha.', 'error');
    setSubmitting(true);
    try {
      const data = await auth('/auth/login', { email, password });
      setUser(data);
      localStorage.setItem('user', JSON.stringify(data));
      setView('home');
      setPassword('');
      notify(`Bem-vindo de volta, ${data.name?.split(' ')[0] || 'cliente'}!`);
    } catch (error) {
      notify(error.message, 'error');
    } finally { setSubmitting(false); }
  };

  const register = async event => {
    event.preventDefault();
    if (!name || !email || password.length < 6) return notify('Informe nome, e-mail e uma senha com pelo menos 6 caracteres.', 'error');
    setSubmitting(true);
    try {
      const data = await auth('/auth/register', { name, email, password });
      setUser(data);
      localStorage.setItem('user', JSON.stringify(data));
      setView('home');
      setPassword('');
      notify(`Conta criada. Bem-vindo, ${data.name?.split(' ')[0] || name.split(' ')[0]}!`);
    } catch (error) {
      notify(error.message, 'error');
    } finally { setSubmitting(false); }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    setView('home');
    notify('Você saiu da sua conta.');
  };

  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const subtotal = cart.reduce((sum, item) => sum + Number(item.price) * item.qty, 0);
  const shipping = subtotal > 0 && subtotal < 150 ? 12.9 : 0;
  const total = subtotal + shipping;

  const addToCart = product => {
    const current = cart.find(item => item.id === product.id);
    if (current && current.qty >= product.stock) return notify(`Limite de estoque atingido para ${product.name}.`, 'error');
    setCart(items => current
      ? items.map(item => item.id === product.id ? { ...item, qty: item.qty + 1, stock: product.stock } : item)
      : [...items, { ...product, qty: 1 }]
    );
    notify(`${product.name} foi adicionado ao carrinho.`);
  };

  const changeQty = (id, delta) => {
    setCart(items => items.map(item => {
      if (item.id !== id) return item;
      const next = item.qty + delta;
      if (next <= 0) return null;
      if (next > item.stock) { notify('Quantidade máxima disponível em estoque.', 'error'); return item; }
      return { ...item, qty: next };
    }).filter(Boolean));
  };

  const removeFromCart = id => setCart(items => items.filter(item => item.id !== id));

  const loadAccount = async () => {
    if (!user) return setView('auth');
    setLoadingAccount(true);
    try {
      const data = await request('/orders/mine', { headers: { Authorization: `Bearer ${user.token}` } });
      setOrders(Array.isArray(data) ? data : []);
      setView('account');
      setMobileMenu(false);
    } catch (error) {
      notify(error.message, 'error');
    } finally { setLoadingAccount(false); }
  };

  const loadOrders = async () => {
    if (!user) return setView('auth');
    setLoadingOrders(true);
    try {
      const data = await request('/orders/mine', { headers: { Authorization: `Bearer ${user.token}` } });
      setOrders(Array.isArray(data) ? data : []);
      setView('orders');
      setMobileMenu(false);
    } catch (error) {
      notify(error.message, 'error');
    } finally { setLoadingOrders(false); }
  };

  const loadAdminProducts = async () => {
    if (!user || user.role !== 'ADMIN') return notify('Acesso restrito ao administrador.', 'error');
    setLoadingAdmin(true);
    try {
      setAdminProducts(await request('/products', { headers: { Authorization: `Bearer ${user.token}` } }));
      setView('admin');
      setMobileMenu(false);
    } catch (error) {
      notify(error.message, 'error');
    } finally { setLoadingAdmin(false); }
  };

  const resetAdminForm = () => setAdminForm({ id: null, name: '', description: '', price: '', stock: '', imageUrl: '', active: true });

  const saveAdminProduct = async event => {
    event.preventDefault();
    if (!adminForm.name.trim() || Number(adminForm.price) <= 0 || Number(adminForm.stock) < 0) {
      return notify('Informe nome, preço maior que zero e estoque igual ou maior que zero.', 'error');
    }
    setSubmitting(true);
    try {
      const body = {
        name: adminForm.name.trim(),
        description: adminForm.description.trim(),
        price: Number(adminForm.price),
        stock: Number(adminForm.stock),
        imageUrl: adminForm.imageUrl.trim()
      };
      const method = adminForm.id ? 'PUT' : 'POST';
      const path = adminForm.id ? `/products/${adminForm.id}` : '/products';
      const saved = await request(path, { method, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` }, body: JSON.stringify(body) });
      setAdminProducts(items => adminForm.id ? items.map(item => item.id === saved.id ? saved : item) : [...items, saved]);
      if (saved.active) setProducts(items => items.some(item => item.id === saved.id) ? items.map(item => item.id === saved.id ? saved : item) : [...items, saved]);
      resetAdminForm();
      notify(adminForm.id ? 'Produto atualizado com sucesso.' : 'Produto cadastrado com sucesso.');
    } catch (error) { notify(error.message, 'error'); }
    finally { setSubmitting(false); }
  };

  const toggleAdminProduct = async product => {
    setSubmitting(true);
    try {
      if (product.active) {
        await request(`/products/${product.id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${user.token}` } });
        setAdminProducts(items => items.map(item => item.id === product.id ? { ...item, active: false } : item));
        setProducts(items => items.filter(item => item.id !== product.id));
        notify(`${product.name} foi desativado.`);
      } else {
        const saved = await request(`/products/${product.id}/activate`, { method: 'POST', headers: { Authorization: `Bearer ${user.token}` } });
        setAdminProducts(items => items.map(item => item.id === saved.id ? saved : item));
        setProducts(items => items.some(item => item.id === saved.id) ? items.map(item => item.id === saved.id ? saved : item) : [...items, saved]);
        notify(`${product.name} foi reativado.`);
      }
    } catch (error) { notify(error.message, 'error'); }
    finally { setSubmitting(false); }
  };

  const checkout = async () => {
    setSubmitting(true);
    try {
      await request('/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
        body: JSON.stringify({ items: cart.map(item => ({ productId: item.id, quantity: item.qty })) })
      });
      setCart([]);
      setConfirmCheckout(false);
      setOrderCompleted(true);
      try {
        const updatedOrders = await request('/orders/mine', { headers: { Authorization: `Bearer ${user.token}` } });
        setOrders(updatedOrders);
      } catch {
        // A confirmação do pedido já foi concluída; o histórico poderá ser atualizado ao abrir “Meus pedidos”.
      }
      setView('orderSuccess');
      notify('Pedido realizado com sucesso!');
      loadProducts();
    } catch (error) {
      notify(error.message, 'error');
    } finally { setSubmitting(false); }
  };

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase();
    const list = products.filter(product => !term || `${product.name} ${product.description}`.toLowerCase().includes(term));
    return [...list].sort((a, b) => {
      if (sort === 'priceAsc') return Number(a.price) - Number(b.price);
      if (sort === 'priceDesc') return Number(b.price) - Number(a.price);
      if (sort === 'name') return a.name.localeCompare(b.name);
      return a.id - b.id;
    });
  }, [products, search, sort]);

  const go = target => {
    if (target === 'home') setOrderCompleted(false);
    setView(target);
    setMobileMenu(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="header-inner">
          <button className="brand" onClick={() => go('home')} aria-label="Ir para início">
            <span className="brand-mark"><Icon name="package" size={22} /></span>
            <span><strong>Super</strong><b>Sec</b><small>limpeza prática para sua casa</small></span>
          </button>

          <div className="desktop-search">
            <Icon name="search" size={18} />
            <input value={search} onChange={e => { setSearch(e.target.value); if (view !== 'home') setView('home'); }} placeholder="Buscar produtos..." />
            {search && <button className="clear-search" onClick={() => setSearch('')}><Icon name="close" size={16} /></button>}
          </div>

          <nav className="main-nav">
            <button className={view === 'home' ? 'active' : ''} onClick={() => go('home')}>Produtos</button>
            {user && <button className={view === 'orders' ? 'active' : ''} onClick={loadOrders}><Icon name="orders" size={17} />Pedidos</button>}
            {user?.role === 'ADMIN' && <button className={view === 'admin' ? 'active' : ''} onClick={loadAdminProducts}><Icon name="edit" size={17} />Admin</button>}
            <button className="nav-user" onClick={user ? loadAccount : () => go('auth')}><Icon name="user" size={18} /><span>{user ? user.name?.split(' ')[0] : 'Entrar'}</span></button>
            <button className="cart-button" onClick={() => go('cart')}><Icon name="cart" size={19} /><span>Carrinho</span>{cartCount > 0 && <em>{cartCount}</em>}</button>
          </nav>

          <button className="mobile-menu-button" onClick={() => setMobileMenu(!mobileMenu)}><Icon name={mobileMenu ? 'close' : 'menu'} /></button>
        </div>
        {mobileMenu && <div className="mobile-nav"><button onClick={() => go('home')}>Produtos</button>{user && <button onClick={loadOrders}>Meus pedidos</button>}{user?.role === 'ADMIN' && <button onClick={loadAdminProducts}>Administração</button>}<button onClick={user ? loadAccount : () => go('auth')}>{user ? 'Minha conta' : 'Entrar'}</button><button onClick={() => go('cart')}>Carrinho ({cartCount})</button></div>}
      </header>

      {notice && <div className={`toast ${notice.type}`}><span className="toast-icon"><Icon name={notice.type === 'error' ? 'close' : 'check'} size={17} /></span><span>{notice.message}</span><button onClick={() => setNotice(null)}><Icon name="close" size={16} /></button></div>}

      {view === 'orderSuccess' && <OrderSuccessView go={go} loadOrders={loadOrders} />}
      {view === 'home' && <HomeView products={filteredProducts} loading={loadingProducts} search={search} sort={sort} setSort={setSort} addToCart={addToCart} onDetails={setSelectedProduct} />}
      {view === 'cart' && <CartView cart={cart} subtotal={subtotal} shipping={shipping} total={total} user={user} changeQty={changeQty} removeFromCart={removeFromCart} go={go} onCheckout={() => setConfirmCheckout(true)} />}
      {view === 'auth' && <AuthView mode={authMode} setMode={setAuthMode} email={email} setEmail={setEmail} password={password} setPassword={setPassword} name={name} setName={setName} login={login} register={register} submitting={submitting} />}
      {view === 'account' && <AccountView user={user} orders={orders} loading={loadingAccount} go={go} loadOrders={loadOrders} logout={logout} />}
      {view === 'orders' && <OrdersView orders={orders} loading={loadingOrders} user={user} go={go} logout={logout} />}
      {view === 'admin' && <AdminView products={adminProducts} loading={loadingAdmin} form={adminForm} setForm={setAdminForm} onSubmit={saveAdminProduct} onEdit={product => setAdminForm({ id: product.id, name: product.name || '', description: product.description || '', price: product.price ?? '', stock: product.stock ?? '', imageUrl: product.imageUrl || '', active: product.active })} onToggle={toggleAdminProduct} onReset={resetAdminForm} submitting={submitting} onRefresh={loadAdminProducts} />}

      <footer className="site-footer">
        <div><div className="footer-brand">Super<span>Sec</span></div><p>Produtos de limpeza para casa, escritório e rotina diária.</p></div>
        <div className="footer-info"><span><Icon name="shield" size={17} /> Loja SuperSec</span><span><Icon name="package" size={17} /> Compra registrada com segurança</span></div>
        <small>SuperSec • React + Spring Boot + PostgreSQL + Docker</small>
      </footer>

      {selectedProduct && <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} onAdd={() => { addToCart(selectedProduct); setSelectedProduct(null); }} />}
      {confirmCheckout && <CheckoutModal total={total} submitting={submitting} onClose={() => setConfirmCheckout(false)} onConfirm={checkout} />}
    </div>
  );
}

function OrderSuccessView({ go, loadOrders }) {
  return <main className="success-page">
    <section className="success-card">
      <div className="success-icon"><Icon name="check" size={34} /></div>
      <span className="section-kicker">PEDIDO CONFIRMADO</span>
      <h1>Obrigado pela sua compra!</h1>
      <p>Seu pedido foi registrado com sucesso. Agradecemos por escolher a SuperSec para cuidar da limpeza da sua casa.</p>
      <div className="success-highlight"><Icon name="package" size={20} /><span>Você pode acompanhar o pedido na área <strong>Meus pedidos</strong>.</span></div>
      <div className="success-actions"><button className="primary-btn success-home-btn" onClick={() => go('home')}>Voltar a comprar <Icon name="arrow" size={18} /></button><button className="secondary-btn success-orders-btn" onClick={loadOrders}>Ver meus pedidos</button></div>
    </section>
  </main>;
}

function HomeView({ products, loading, search, sort, setSort, addToCart, onDetails }) {
  return <main>
    <section className="hero">
      <div className="hero-copy">
        <span className="eyebrow">LOJA DE LIMPEZA</span>
        <h1>Tudo para deixar sua casa <br /><span>limpa de verdade.</span></h1>
        <p>Rodos, detergentes, desinfetantes, vassouras e muito mais. Escolha seus produtos de limpeza e receba tudo em um só pedido.</p>
        <div className="hero-points"><span><Icon name="check" size={16} /> Compra fácil</span><span><Icon name="shield" size={16} /> Produtos de limpeza</span><span><Icon name="package" size={16} /> Pedido acompanhado</span></div>
      </div>
      <div className="hero-card"><img src="/images/supersec-hero.png" alt="Produtos de limpeza SuperSec" /><strong>Limpeza completa em poucos cliques.</strong><span>Produtos para cozinha, banheiro, pisos, roupas e toda a casa.</span></div>
    </section>

    <section className="catalog-section" id="catalogo">
      <div className="section-heading"><div><span className="section-kicker">CATÁLOGO</span><h2>Produtos de limpeza</h2><p>{search ? `${products.length} resultado(s) para “${search}”` : 'Produtos essenciais para sua rotina de limpeza.'}</p></div><label className="sort-select">Ordenar por<select value={sort} onChange={e => setSort(e.target.value)}><option value="featured">Destaques</option><option value="name">Nome</option><option value="priceAsc">Menor preço</option><option value="priceDesc">Maior preço</option></select><Icon name="chevron" size={16} /></label></div>
      {loading ? <div className="product-grid">{[1,2,3,4].map(i => <div className="product-card skeleton-card" key={i}><div className="skeleton image"/><div className="skeleton line"/><div className="skeleton line short"/><div className="skeleton button"/></div>)}</div>
      : products.length === 0 ? <div className="empty-state"><div><Icon name="search" size={30} /></div><h3>Nenhum produto encontrado</h3><p>Tente buscar por outro nome ou remova o filtro.</p></div>
      : <div className="product-grid">{products.map(product => <ProductCard key={product.id} product={product} addToCart={addToCart} onDetails={onDetails} />)}</div>}
    </section>
  </main>;
}

function ProductCard({ product, addToCart, onDetails }) {
  const [broken, setBroken] = useState(false);
  const outOfStock = Number(product.stock) <= 0;
  return <article className="product-card">
    <div className="product-image-wrap">
      {!broken && product.imageUrl ? <img src={product.imageUrl} alt={product.name} onError={() => setBroken(true)} /> : <div className="image-fallback"><Icon name="package" size={40} /></div>}
      <span className={`stock-badge ${outOfStock ? 'out' : ''}`}>{outOfStock ? 'Esgotado' : `${product.stock} em estoque`}</span>
    </div>
    <div className="product-content"><span className="product-category">SUPERSEC</span><button className="product-details" onClick={() => onDetails(product)}>Ver detalhes</button><h3>{product.name}</h3><p>{product.description}</p><div className="product-bottom"><strong>{money(product.price)}</strong><button disabled={outOfStock} onClick={() => addToCart(product)}>{outOfStock ? 'Indisponível' : <><Icon name="plus" size={17} /> Adicionar</>}</button></div></div>
  </article>;
}

function CartView({ cart, subtotal, shipping, total, user, changeQty, removeFromCart, go, onCheckout }) {
  return <main className="inner-page"><div className="page-title"><div><span className="section-kicker">SEU PEDIDO</span><h1>Carrinho</h1><p>Revise os itens antes de finalizar.</p></div><button className="back-link" onClick={() => go('home')}>← Continuar comprando</button></div>
    {cart.length === 0 ? <div className="empty-state large"><div><Icon name="cart" size={34} /></div><h2>Seu carrinho está vazio</h2><p>Escolha alguns produtos para começar seu pedido.</p><button className="primary-btn" onClick={() => go('home')}>Ver produtos <Icon name="arrow" size={17} /></button></div>
    : <div className="cart-layout"><section className="cart-items">{cart.map(item => <div className="cart-item" key={item.id}><div className="cart-thumb">{item.imageUrl ? <img src={item.imageUrl} alt="" /> : <Icon name="package" />}</div><div className="cart-product"><strong>{item.name}</strong><span>{money(item.price)} por unidade</span></div><div className="quantity"><button onClick={() => changeQty(item.id, -1)}><Icon name="minus" size={15} /></button><b>{item.qty}</b><button onClick={() => changeQty(item.id, 1)}><Icon name="plus" size={15} /></button></div><strong className="item-total">{money(item.price * item.qty)}</strong><button className="remove-btn" onClick={() => removeFromCart(item.id)} title="Remover"><Icon name="trash" size={18} /></button></div>)}<div className="cart-note"><Icon name="shield" size={18} /><span>O estoque é validado novamente no momento da confirmação do pedido.</span></div></section>
      <aside className="summary"><h2>Resumo</h2><div><span>Subtotal</span><strong>{money(subtotal)}</strong></div><div><span>Entrega</span><strong>{shipping === 0 ? 'Grátis' : money(shipping)}</strong></div>{shipping > 0 && <small>Frete grátis em compras a partir de R$ 150,00.</small>}<div className="summary-total"><span>Total</span><strong>{money(total)}</strong></div><button className="checkout-btn" onClick={user ? onCheckout : () => go('auth')}>{user ? <>Finalizar pedido <Icon name="arrow" size={18} /></> : <>Entrar para finalizar <Icon name="arrow" size={18} /></>}</button>{!user && <p className="summary-hint">Você precisa estar conectado para registrar o pedido.</p>}</aside></div>}
  </main>;
}

function AuthView({ mode, setMode, email, setEmail, password, setPassword, name, setName, login, register, submitting }) {
  const isLogin = mode === 'login';
  return <main className="auth-page"><div className="auth-card"><div className="auth-side"><span className="brand-mark big"><Icon name="package" size={28} /></span><span className="eyebrow">SUPERSEC</span><h1>{isLogin ? 'Bem-vindo de volta.' : 'Crie sua conta.'}</h1><p>{isLogin ? 'Entre para finalizar compras e acompanhar seus pedidos em um só lugar.' : 'Cadastre-se gratuitamente para montar seu carrinho e acompanhar seus pedidos.'}</p><div className="auth-benefits"><span><Icon name="check" size={16} /> Histórico de pedidos</span><span><Icon name="check" size={16} /> Checkout integrado</span><span><Icon name="check" size={16} /> Dados protegidos</span></div></div><div className="auth-form"><div className="auth-tabs"><button className={isLogin ? 'active' : ''} onClick={() => setMode('login')}>Entrar</button><button className={!isLogin ? 'active' : ''} onClick={() => setMode('register')}>Criar conta</button></div><div className="form-heading"><span>{isLogin ? 'ACESSO À CONTA' : 'NOVO CADASTRO'}</span><h2>{isLogin ? 'Entre na sua conta' : 'Comece agora'}</h2><p>{isLogin ? 'Use seus dados cadastrados.' : 'Leva menos de um minuto.'}</p></div><form onSubmit={isLogin ? login : register}>{!isLogin && <label>Nome completo<input value={name} onChange={e => setName(e.target.value)} placeholder="Seu nome" autoComplete="name" /></label>}<label>E-mail<input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="voce@email.com" autoComplete="email" /></label><label>Senha<input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder={isLogin ? 'Sua senha' : 'Mínimo de 6 caracteres'} autoComplete={isLogin ? 'current-password' : 'new-password'} /></label><button className="primary-btn form-submit" disabled={submitting}>{submitting ? 'Aguarde...' : isLogin ? 'Entrar na conta' : 'Criar minha conta'} <Icon name="arrow" size={17} /></button></form><small className="privacy-note"><Icon name="shield" size={15} /> Seus dados são usados apenas para autenticação do sistema.</small></div></div></main>;
}

function AccountView({ user, orders, loading, go, loadOrders, logout }) {
  const firstName = user?.name?.split(' ')[0] || 'cliente';
  return <main className="inner-page account-page">
    <div className="page-title account-title">
      <div><span className="section-kicker">MINHA CONTA</span><h1>Olá, {firstName}!</h1><p>Gerencie seu cadastro e acompanhe suas compras.</p></div>
      <button className="logout-link" onClick={logout}><Icon name="logout" size={17} /> Sair da conta</button>
    </div>
    <div className="account-layout">
      <section className="account-card">
        <div className="account-avatar"><Icon name="user" size={30} /></div>
        <div className="account-details"><span className="section-kicker">SEUS DADOS</span><h2>Cadastro</h2><div className="account-field"><small>Nome</small><strong>{user?.name || '-'}</strong></div><div className="account-field"><small>E-mail</small><strong>{user?.email || '-'}</strong></div></div>
      </section>
      <section className="account-card account-actions-card">
        <div className="account-action-icon"><Icon name="orders" size={25} /></div>
        <div><span className="section-kicker">PEDIDOS</span><h2>Suas compras</h2><p>{loading ? 'Carregando histórico...' : `${orders.length} pedido(s) registrado(s).`}</p><button className="primary-btn" onClick={loadOrders} disabled={loading}>{loading ? 'Carregando...' : 'Ver meus pedidos'} <Icon name="arrow" size={17} /></button></div>
      </section>
    </div>
    <div className="account-bottom-actions"><button className="secondary-btn" onClick={() => go('home')}>Voltar à loja</button><button className="logout-link danger" onClick={logout}><Icon name="logout" size={17} /> Sair da conta</button></div>
  </main>;
}

function OrdersView({ orders, loading, user, go, logout }) {
  return <main className="inner-page"><div className="page-title account-title"><div><span className="section-kicker">MINHA CONTA</span><h1>Meus pedidos</h1><p>Acompanhe o histórico das suas compras.</p></div><button className="logout-link" onClick={logout}><Icon name="logout" size={17} /> Sair</button></div><div className="orders-list">{loading ? <div className="loading-panel">Carregando seus pedidos...</div> : orders.length === 0 ? <div className="empty-state large"><div><Icon name="package" size={34} /></div><h2>Nenhum pedido ainda</h2><p>Quando você finalizar uma compra, ela aparecerá aqui.</p><button className="primary-btn" onClick={() => go('home')}>Explorar produtos <Icon name="arrow" size={17} /></button></div> : orders.map(order => <OrderCard key={order.id} order={order} />)}</div><div className="account-strip"><div><strong>Olá, {user?.name?.split(' ')[0] || 'cliente'}!</strong><span>Obrigado por comprar com a SuperSec.</span></div><button onClick={() => go('home')}>Voltar à loja</button></div></main>;
}

function OrderCard({ order }) {
  const status = { PENDING: ['Aguardando', 'pending'], PROCESSING: ['Em processamento', 'processing'], SHIPPED: ['Enviado', 'shipped'], DELIVERED: ['Entregue', 'delivered'], CANCELED: ['Cancelado', 'canceled'] }[order.status] || [order.status, 'pending'];
  const date = order.createdAt ? new Date(order.createdAt).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }) : '';
  return <article className="order-card"><div className="order-main"><div className="order-icon"><Icon name="package" size={22} /></div><div><span className="order-number">PEDIDO #{order.id}</span><h3>{money(order.total)}</h3><p>{date} • {order.items?.length || 0} item(ns)</p></div></div><span className={`status ${status[1]}`}><i />{status[0]}</span></article>;
}

function AdminView({ products, loading, form, setForm, onSubmit, onEdit, onToggle, onReset, submitting, onRefresh }) {
  return <main className="inner-page admin-page">
    <div className="page-title"><div><span className="section-kicker">GESTÃO</span><h1>Administração de produtos</h1><p>Cadastre, edite e desative produtos do catálogo.</p></div><button className="back-link" onClick={onRefresh}><Icon name="refresh" size={16} /> Atualizar lista</button></div>
    <div className="admin-layout">
      <form className="admin-form" onSubmit={onSubmit}>
        <div className="form-heading"><span>{form.id ? 'EDIÇÃO' : 'NOVO PRODUTO'}</span><h2>{form.id ? 'Editar produto' : 'Cadastrar produto'}</h2><p>Os dados são salvos diretamente no PostgreSQL.</p></div>
        <label>Nome<input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required /></label>
        <label>Descrição<textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows="4" /></label>
        <div className="admin-form-grid"><label>Preço<input type="number" min="0.01" step="0.01" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required /></label><label>Estoque<input type="number" min="0" step="1" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} required /></label></div>
        <label>URL da imagem<input type="url" value={form.imageUrl} onChange={e => setForm({ ...form, imageUrl: e.target.value })} placeholder="https://..." /></label>
        <div className="admin-form-actions"><button type="button" className="secondary-btn" onClick={onReset}>Limpar</button><button className="primary-btn" disabled={submitting}>{submitting ? 'Salvando...' : form.id ? 'Salvar alterações' : 'Cadastrar produto'}</button></div>
      </form>
      <section className="admin-list"><div className="admin-list-head"><div><strong>Catálogo cadastrado</strong><span>{products.length} produto(s)</span></div></div>{loading ? <div className="loading-panel">Carregando produtos...</div> : products.length === 0 ? <div className="empty-state"><h3>Nenhum produto cadastrado</h3></div> : products.map(product => <article className={`admin-product ${product.active ? '' : 'inactive'}`} key={product.id}><div className="admin-product-image">{product.imageUrl ? <img src={product.imageUrl} alt="" /> : <Icon name="package" />}</div><div className="admin-product-info"><strong>{product.name}</strong><span>{money(product.price)} • {product.stock} em estoque</span><small>{product.active ? 'Ativo no catálogo' : 'Desativado'}</small></div><div className="admin-product-actions"><button title="Editar" onClick={() => onEdit(product)}><Icon name="edit" size={16} /></button><button title={product.active ? 'Desativar' : 'Reativar'} onClick={() => onToggle(product)} disabled={submitting}><Icon name={product.active ? 'power' : 'refresh'} size={16} /></button></div></article>)}</section>
    </div>
  </main>;
}

function ProductModal({ product, onClose, onAdd }) {
  const [broken, setBroken] = useState(false);
  const outOfStock = Number(product.stock) <= 0;
  return <div className="modal-backdrop" onMouseDown={e => e.target === e.currentTarget && onClose()}><div className="product-modal"><button className="modal-close" onClick={onClose}><Icon name="close" /></button><div className="modal-product-image">{!broken && product.imageUrl ? <img src={product.imageUrl} alt={product.name} onError={() => setBroken(true)} /> : <div className="image-fallback"><Icon name="package" size={54} /></div>}</div><div className="product-modal-body"><span className="section-kicker">DETALHES DO PRODUTO</span><h2>{product.name}</h2><p>{product.description}</p><div className="product-modal-meta"><strong>{money(product.price)}</strong><span>{outOfStock ? 'Sem estoque' : `${product.stock} unidades disponíveis`}</span></div><button className="primary-btn" disabled={outOfStock} onClick={onAdd}>{outOfStock ? 'Produto esgotado' : <><Icon name="cart" size={18} /> Adicionar ao carrinho</>}</button></div></div></div>;
}

function CheckoutModal({ total, submitting, onClose, onConfirm }) {
  return <div className="modal-backdrop" onMouseDown={e => e.target === e.currentTarget && onClose()}><div className="modal"><button className="modal-close" onClick={onClose}><Icon name="close" /></button><div className="modal-icon"><Icon name="check" size={30} /></div><span className="section-kicker">CONFIRMAÇÃO</span><h2>Finalizar este pedido?</h2><p>O pedido será registrado no sistema e o estoque dos produtos será atualizado.</p><div className="modal-total"><span>Total</span><strong>{money(total)}</strong></div><div className="modal-actions"><button className="secondary-btn" onClick={onClose}>Voltar</button><button className="primary-btn" disabled={submitting} onClick={onConfirm}>{submitting ? 'Registrando...' : 'Confirmar pedido'} <Icon name="check" size={17} /></button></div><small>Pagamento real não é processado neste protótipo acadêmico.</small></div></div>;
}

createRoot(document.getElementById('root')).render(<App />);
