function slideTo(nextIndex, direction) {
  if (animating) return;
  animating = true;

  const nextSrc = images[nextIndex];
  const preImg = new Image();
  preImg.src = nextSrc;

  // wacht tot de nieuwe foto klaar is
  preImg.onload = () => {
    imgNext.src = nextSrc;
    imgNext.style.transition = "none";
    img.style.transition = "none";
    imgNext.style.transform = `translateX(${direction * 100}%)`;

    // start animatie zodra geladen
    requestAnimationFrame(() => {
      imgNext.style.transition = `transform ${DURATION}ms ease`;
      img.style.transition     = `transform ${DURATION}ms ease`;
      img.style.transform      = `translateX(${-direction * 100}%)`;
      imgNext.style.transform  = "translateX(0)";
    });

    // reset lagen na animatie
    setTimeout(() => {
      img.src = nextSrc;
      img.style.transition = "none";
      img.style.transform  = "translateX(0)";
      imgNext.style.transition = "none";
      imgNext.style.transform  = "translateX(100%)";
      i = nextIndex;
      animating = false;
    }, DURATION);
  };

  preImg.onerror = () => {
    console.warn("Kon afbeelding niet laden:", nextSrc);
    animating = false;
  };
}
