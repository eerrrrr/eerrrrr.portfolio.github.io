/* =========================================
   Project sidebar: keep Previous/Next Work always reachable
   =========================================
   Loaded only on project detail pages (script.js is homepage-only).

   On the sticky, fixed-height desktop layout, a long title/description
   can push content past the bottom of the sidebar's own box (Previous/
   Next Work ends up just out of view). Rather than let that happen, hide
   PROJECT SKILLS first to reclaim the room it needs -- checked directly
   against actual overflow (scrollHeight vs clientHeight) since it depends
   on real content length, not a fixed screen-width breakpoint. No-op on
   the mobile stacked layout, where the sidebar's height is auto and
   nothing can overflow it.
   ========================================= */
document.addEventListener('DOMContentLoaded', function () {
    const aside = document.querySelector('.project-info-sidebar');
    if (!aside) return;
    const skills = aside.querySelector('.skills-content');
    if (!skills) return;

    function checkFit() {
        skills.classList.remove('js-hidden');
        if (aside.scrollHeight > aside.clientHeight + 1) {
            skills.classList.add('js-hidden');
        }
    }

    checkFit();
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(checkFit, 150);
    });
});
