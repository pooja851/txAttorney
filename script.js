
function infiniteScroll({
                          containerId,
                          speed = 0.5,
                          scrollDirection = 'vertical', // 'vertical' or 'horizontal'
                          moveDirection = 'forward',    // 'forward' or 'backward'
                          gap = 20,
                          duplicateTimes = 5
                        }) {
  const container = document.getElementById(containerId);
  const parent = container.parentElement;
  const isVertical = scrollDirection === 'vertical';
  const dir = moveDirection === 'forward' ? -1 : 1; // forward = up/left
  let paused = false;
  let offset = 0;
  let inactivityTimer;

  // Duplicate slides multiple times for a long seamless loop
  const originalSlides = [...container.children];
  for (let i = 0; i < duplicateTimes; i++) {
    originalSlides.forEach(slide => {
      const clone = slide.cloneNode(true);
      clone.style.margin = isVertical
          ? `${gap / 2}px 0`
          : `0 ${gap / 2}px`;
      container.appendChild(clone);
    });
  }

  // Calculate total scroll length
  const totalLength = isVertical
      ? container.scrollHeight
      : container.scrollWidth;

  // Pause/resume on user activity
  function resetInactivityTimer() {
    clearTimeout(inactivityTimer);
    paused = true;
    inactivityTimer = setTimeout(() => paused = false, 2000);
  }
  parent.addEventListener('mouseenter', resetInactivityTimer);
  parent.addEventListener('mousemove', resetInactivityTimer);
  parent.addEventListener('mouseleave', () => paused = false);

  function animate() {
    if (!paused) {
      offset += dir * speed;
      const loopPoint = totalLength / (duplicateTimes + 1); // reset point

      if (dir === -1 && Math.abs(offset) >= loopPoint) {
        offset = 0;
      } else if (dir === 1 && offset >= loopPoint) {
        offset = 0;
      }

      container.style.transform = isVertical
          ? `translateY(${offset}px)`
          : `translateX(${offset}px)`;
    }
    requestAnimationFrame(animate);
  }

  animate();
}

// ===== Example usage =====

// Vertical, moving up
infiniteScroll({
  containerId: 'left-sidebar',
  speed: 0.3,
  scrollDirection: 'vertical',
  moveDirection: 'forward',
  duplicateTimes: 5
});
infiniteScroll({
  containerId: 'right-sidebar',
  speed: 0.3,
  scrollDirection: 'vertical',
  moveDirection: 'forward',
  duplicateTimes: 5
});

// Horizontal, moving left
// infiniteScroll({
//   containerId: 'top-slider',
//   speed: 1,
//   scrollDirection: 'horizontal',
//   moveDirection: 'forward',
//   duplicateTimes: 5
// });
