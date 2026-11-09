/**
 * AssetTFM - shared browser script (browser-static, no server, no network calls).
 *
 * Single canonical source for the global header/main navigation and the footer.
 * Each page supplies two placeholders and loads this script:
 *   <header data-global-header></header>
 *   <footer data-global-footer></footer>
 *
 * Page-specific subnavigation is NOT defined here. It is a repeatable HTML block
 * (.section-subnav) authored inside each page. See the brief: brief-component.txt BSeg-03.
 *
 * Paths: all pages sit in one directory (public/), so links are relative. If pages are
 * ever moved into nested folders, change PATH_PREFIX once.
 *
 * Shared markup is built from fixed trusted content below using textContent / DOM
 * methods only. No visitor input and no innerHTML.
 */

const PATH_PREFIX = '';

/* ---- Canonical content ------------------------------------------------- */

const SITE = {
    name: 'AssetTFM',
    brandLine: 'Quality Service. Practical Solutions. Trusted Results.',
    logo: 'images/assettfm-logo.svg',
    // Business details: confirm exact public wording before launch (brief-domain.txt).
    address: ['689 Canterbury Road', 'Surrey Hills VIC 3129'],
    legal: 'AssetTFM is a trading name of ASSETT FACILITIES MANAGEMENT PTY LTD. ABN 68 113 231 931.',
    contactNote: 'Contact AssetTFM through the website enquiry forms.',
    // Approved social URLs have not been supplied. Add { label, href, icon } entries here
    // once confirmed; the footer renders them automatically and shows nothing while empty.
    social: []
};

/* Six major areas. `prefix` marks every page that belongs to the area. */
const AREAS = [
    { label: 'Home', href: 'index.html', pages: ['index.html'] },
    { label: 'About', href: 'about.html', pages: ['about.html'] },
    { label: 'Services', href: 'services.html', prefix: 'services' },
    { label: 'Clients', href: 'clients.html', pages: ['clients.html'] },
    { label: 'Photos', href: 'photos.html', pages: ['photos.html'] },
    { label: 'Enquiries', href: 'enquiries.html', prefix: 'enquiries' }
];

const FOOTER_GROUPS = [
    {
        heading: 'Site',
        links: [
            ['Home', 'index.html'],
            ['About', 'about.html'],
            ['Clients', 'clients.html'],
            ['Photos', 'photos.html']
        ]
    },
    {
        heading: 'Services',
        links: [
            ['Services Overview', 'services.html'],
            ['Domestic', 'services-domestic.html'],
            ['Commercial', 'services-commercial.html'],
            ['Government', 'services-government.html'],
            ['Corporate', 'services-corporate.html'],
            ['Public and Corporate Housing', 'services-housing.html'],
            ['Owners Corporation', 'services-owners-corporation.html']
        ]
    },
    {
        heading: 'Enquiries',
        links: [
            ['Enquiries Overview', 'enquiries.html'],
            ['General Enquiry', 'enquiries-general.html'],
            ['Service Enquiry', 'enquiries-service.html'],
            ['Project Enquiry', 'enquiries-project.html']
        ]
    }
];

const PRIVACY_LINK = ['Privacy Policy', 'privacy.html'];

/* ---- Helpers ------------------------------------------------------------ */

function currentPage() {
    const last = window.location.pathname.split('/').pop();
    return last === '' ? 'index.html' : last;
}

function href(path) {
    return PATH_PREFIX + path;
}

function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
}

function link(label, path, className) {
    const a = el('a', className, label);
    a.href = href(path);
    return a;
}

function areaIsCurrent(area, page) {
    if (area.pages) return area.pages.includes(page);
    return page === area.prefix + '.html' || page.startsWith(area.prefix + '-');
}

/* ---- Header and main navigation ---------------------------------------- */

function renderHeader() {
    const target = document.querySelector('[data-global-header]');
    if (!target) return;

    const page = currentPage();
    target.classList.add('site-header');

    const inner = el('div', 'site-header__inner');

    const brand = el('a', 'site-header__brand');
    brand.href = href('index.html');
    brand.setAttribute('aria-label', SITE.name + ' home');
    const logo = el('img', 'site-header__logo');
    logo.src = href(SITE.logo);
    logo.alt = SITE.name;
    logo.width = 185;
    logo.height = 30;
    brand.append(logo);

    const toggle = el('button', 'nav-toggle');
    toggle.type = 'button';
    toggle.id = 'nav-toggle';
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-controls', 'main-navigation');
    toggle.append(el('span', 'nav-toggle__label', 'Menu'), el('span', 'nav-toggle__bars'));
    toggle.lastChild.setAttribute('aria-hidden', 'true');

    const nav = el('nav', 'main-navigation');
    nav.id = 'main-navigation';
    nav.setAttribute('aria-label', 'Main navigation');
    const list = el('ul', 'main-navigation__list');

    AREAS.forEach((area) => {
        const item = el('li');
        const a = link(area.label, area.href, 'main-navigation__link');
        if (areaIsCurrent(area, page)) {
            // "page" for the exact page, "true" when on a sibling page inside the area.
            a.setAttribute('aria-current', area.href === page ? 'page' : 'true');
        }
        item.append(a);
        list.append(item);
    });
    nav.append(list);

    function setOpen(open) {
        toggle.setAttribute('aria-expanded', String(open));
        nav.classList.toggle('is-open', open);
    }

    toggle.addEventListener('click', () => {
        setOpen(toggle.getAttribute('aria-expanded') !== 'true');
    });
    nav.addEventListener('click', (event) => {
        if (event.target.closest('a')) setOpen(false);
    });
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
            setOpen(false);
            toggle.focus();
        }
    });

    inner.append(brand, toggle, nav);
    target.replaceChildren(inner);
}

/* ---- Footer ------------------------------------------------------------- */

function renderFooter() {
    const target = document.querySelector('[data-global-footer]');
    if (!target) return;

    target.classList.add('site-footer');
    const inner = el('div', 'site-footer__inner');

    const about = el('div', 'site-footer__about');
    about.append(el('p', 'site-footer__business', SITE.name));
    about.append(el('p', 'site-footer__line', SITE.brandLine));
    const address = el('address', 'site-footer__address');
    SITE.address.forEach((line, i) => {
        if (i > 0) address.append(document.createElement('br'));
        address.append(document.createTextNode(line));
    });
    about.append(address);
    about.append(el('p', 'site-footer__contact', SITE.contactNote));
    about.append(link('Start an enquiry', 'enquiries.html', 'text-link text-link--light'));

    if (SITE.social.length > 0) {
        const social = el('ul', 'site-footer__social');
        SITE.social.forEach(({ label, href: url }) => {
            const item = el('li');
            const a = el('a', null, label);
            a.href = url;
            a.rel = 'noopener';
            item.append(a);
            social.append(item);
        });
        about.append(social);
    }

    const groups = el('div', 'site-footer__groups');
    FOOTER_GROUPS.forEach((group) => {
        const nav = el('nav', 'site-footer__group');
        nav.setAttribute('aria-label', group.heading);
        nav.append(el('h2', 'site-footer__heading', group.heading));
        const list = el('ul');
        group.links.forEach(([label, path]) => {
            const item = el('li');
            item.append(link(label, path));
            list.append(item);
        });
        nav.append(list);
        groups.append(nav);
    });

    const legal = el('div', 'site-footer__legal');
    legal.append(el('p', null, SITE.legal));
    legal.append(link(PRIVACY_LINK[0], PRIVACY_LINK[1], 'site-footer__privacy'));

    inner.append(about, groups, legal);
    target.replaceChildren(inner);
}

/* ---- Photo gallery filter (Photos page only) ---------------------------- */

function initGalleryFilter() {
    const filters = document.querySelector('[data-gallery-filters]');
    const items = document.querySelectorAll('[data-gallery-item]');
    if (!filters || items.length === 0) return;

    const buttons = filters.querySelectorAll('button[data-filter]');
    const status = document.querySelector('[data-gallery-status]');

    buttons.forEach((button) => {
        button.addEventListener('click', () => {
            const category = button.dataset.filter;
            let shown = 0;
            buttons.forEach((b) => b.setAttribute('aria-pressed', String(b === button)));
            items.forEach((item) => {
                const match = category === 'all' || item.dataset.category === category;
                item.hidden = !match;
                if (match) shown += 1;
            });
            if (status) {
                status.textContent = 'Showing ' + shown + (shown === 1 ? ' photo' : ' photos') +
                    ' for ' + button.textContent.trim() + '.';
            }
        });
    });
}

/* ---- Process steps: staged walk-through (progressive enhancement) --------- */

// Default (no JS, reduced motion, or no IntersectionObserver): every step is shown complete.
// With motion allowed the steps go pending -> active -> complete once, in order, when the list
// first scrolls into view. Step order and labels come from the page HTML; nothing is invented here.
const PROCESS_STEP_DELAY_MS = 650;

function initProcessSteps() {
    const lists = document.querySelectorAll('[data-process-pulse]');
    if (lists.length === 0) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!('IntersectionObserver' in window)) return;

    lists.forEach((list) => {
        const steps = Array.from(list.querySelectorAll('.process-step'));
        if (steps.length === 0) return;

        list.classList.add('is-armed');
        steps.forEach((step) => { step.dataset.state = 'pending'; });

        function walk(index) {
            if (index > 0) steps[index - 1].dataset.state = 'complete';
            if (index >= steps.length) return;
            steps[index].dataset.state = 'active';
            window.setTimeout(() => walk(index + 1), PROCESS_STEP_DELAY_MS);
        }

        const observer = new IntersectionObserver((entries) => {
            if (entries.some((entry) => entry.isIntersecting)) {
                observer.disconnect();
                walk(0);
            }
        }, { threshold: 0.35 });
        observer.observe(list);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    renderHeader();
    renderFooter();
    initGalleryFilter();
    initProcessSteps();
});
