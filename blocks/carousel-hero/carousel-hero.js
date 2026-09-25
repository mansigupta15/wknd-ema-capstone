import { createOptimizedPicture } from '../../scripts/aem.js';

// No option classes are defined for this block; unknown class tokens are ignored.
let instanceCount = 0;

/**
 * Splits a slide row into an image cell and a content cell, tolerating
 * authors who put everything in one cell, omit the image, or add extra cells.
 */
function buildSlide(row, index, carouselId) {
  const slide = document.createElement('li');
  slide.className = 'carousel-hero-slide';
  slide.dataset.slideIndex = index;
  slide.id = `carousel-hero-${carouselId}-slide-${index}`;

  const cells = [...row.children];
  const imageCell = document.createElement('div');
  imageCell.className = 'carousel-hero-slide-image';
  const contentCell = document.createElement('div');
  contentCell.className = 'carousel-hero-slide-content';

  cells.forEach((cell) => {
    const pictures = [...cell.querySelectorAll('picture')];
    const onlyPicture = pictures.length > 0 && cell.textContent.trim() === '';
    if (onlyPicture && !imageCell.querySelector('picture')) {
      imageCell.append(...cell.childNodes);
      return;
    }
    // mixed cell: pull the first picture out into the image area
    if (pictures.length && !imageCell.querySelector('picture')) {
      const pic = pictures[0];
      const wrapper = pic.parentElement;
      imageCell.append(pic);
      if (wrapper && wrapper !== cell && wrapper.textContent.trim() === '' && !wrapper.children.length) {
        wrapper.remove();
      }
    }
    contentCell.append(...cell.childNodes);
  });

  imageCell.querySelectorAll('picture > img').forEach((img) => {
    img.closest('picture').replaceWith(
      createOptimizedPicture(img.src, img.alt, index === 0, [{ media: '(min-width: 900px)', width: '2000' }, { width: '900' }]),
    );
  });

  if (imageCell.querySelector('picture')) slide.append(imageCell);
  else slide.classList.add('carousel-hero-slide-no-image');
  if (contentCell.textContent.trim() !== '' || contentCell.children.length) slide.append(contentCell);

  // link-only paragraph = slide CTA (authored as plain <p><a>, so decorateButtons skips it)
  contentCell.querySelectorAll(':scope > p').forEach((p) => {
    const links = p.querySelectorAll('a[href]');
    if (links.length === 1 && p.textContent.trim() === links[0].textContent.trim()
      && !links[0].querySelector('picture, img')) {
      p.classList.add('carousel-hero-cta');
    }
  });

  const heading = contentCell.querySelector('h1, h2, h3, h4, h5, h6');
  if (heading) {
    if (!heading.id) heading.id = `${slide.id}-title`;
    slide.setAttribute('aria-labelledby', heading.id);
  }

  return slide;
}

function setActive(block, index) {
  const slides = [...block.querySelectorAll('.carousel-hero-slide')];
  if (!slides.length) return;
  const active = ((index % slides.length) + slides.length) % slides.length;
  block.dataset.activeSlide = active;

  slides.forEach((slide, idx) => {
    const isActive = idx === active;
    slide.classList.toggle('carousel-hero-slide-active', isActive);
    slide.setAttribute('aria-hidden', !isActive);
    slide.querySelectorAll('a, button').forEach((el) => {
      if (isActive) el.removeAttribute('tabindex');
      else el.setAttribute('tabindex', '-1');
    });
  });

  block.querySelectorAll('.carousel-hero-indicator button').forEach((btn, idx) => {
    if (idx === active) {
      btn.setAttribute('aria-current', 'true');
      btn.disabled = true;
    } else {
      btn.removeAttribute('aria-current');
      btn.disabled = false;
    }
  });
}

function bindEvents(block) {
  block.querySelectorAll('.carousel-hero-indicator button').forEach((btn, idx) => {
    btn.addEventListener('click', () => setActive(block, idx));
  });
  const current = () => parseInt(block.dataset.activeSlide || '0', 10);
  block.querySelector('.carousel-hero-prev')?.addEventListener('click', () => setActive(block, current() - 1));
  block.querySelector('.carousel-hero-next')?.addEventListener('click', () => setActive(block, current() + 1));

  block.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') setActive(block, current() - 1);
    if (e.key === 'ArrowRight') setActive(block, current() + 1);
  });
}

export default function decorate(block) {
  instanceCount += 1;
  const carouselId = instanceCount;
  const rows = [...block.children].filter((row) => row.textContent.trim() !== '' || row.querySelector('picture'));
  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', 'Carousel');
  // a region landmark needs an accessible name; keep an author/section-provided one
  if (!block.hasAttribute('aria-label') && !block.hasAttribute('aria-labelledby')) {
    block.setAttribute('aria-label', 'Featured highlights');
  }
  block.id = block.id || `carousel-hero-${carouselId}`;

  const slidesList = document.createElement('ul');
  slidesList.className = 'carousel-hero-slides';
  rows.forEach((row, idx) => slidesList.append(buildSlide(row, idx, carouselId)));

  const container = document.createElement('div');
  container.className = 'carousel-hero-slides-container';
  container.append(slidesList);

  const fragments = [container];

  if (rows.length > 1) {
    const controls = document.createElement('div');
    controls.className = 'carousel-hero-controls';

    const nav = document.createElement('nav');
    nav.setAttribute('aria-label', 'Carousel slide controls');
    const indicators = document.createElement('ol');
    indicators.className = 'carousel-hero-indicators';
    rows.forEach((_, idx) => {
      const li = document.createElement('li');
      li.className = 'carousel-hero-indicator';
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.setAttribute('aria-label', `Show slide ${idx + 1} of ${rows.length}`);
      btn.setAttribute('aria-controls', `carousel-hero-${carouselId}-slide-${idx}`);
      li.append(btn);
      indicators.append(li);
    });
    nav.append(indicators);

    const arrows = document.createElement('div');
    arrows.className = 'carousel-hero-arrows';
    arrows.innerHTML = `
      <button type="button" class="carousel-hero-prev" aria-label="Previous slide"></button>
      <button type="button" class="carousel-hero-next" aria-label="Next slide"></button>`;

    controls.append(nav, arrows);
    fragments.push(controls);
  } else {
    block.classList.add('carousel-hero-single');
  }

  block.replaceChildren(...fragments);
  setActive(block, 0);
  if (rows.length > 1) bindEvents(block);
}
