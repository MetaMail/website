import React, { useState, useEffect } from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
interface CarouselProps {
  slides: Array<{ content: JSX.Element }>;
  autoplayInterval?: number;
}
const Carousel: React.FC<CarouselProps> = ({ slides, autoplayInterval = 2000 }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
    }, autoplayInterval);

    return () => clearInterval(intervalId);
  }, [currentIndex, slides.length, autoplayInterval]);

  const settings = {
    dots: false,
    infinite: true,
    speed: 3000,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: false, // Autoplay handled manually
    arrows: false,
  };

  return (
    <Slider {...settings} className="relative items-center flex-col lg:flex lg:flex-row w-11/12 xl:w-5/6 2xl:w-2/3 max-w-500  -top-200 mx-auto border border-[#1e1e1e] bg-white rounded-28  justify-around z-10">
      {slides.map((slide, index) => (
        <div key={index} className={`h-auto md:h-360 lg:h-360   ${index === currentIndex ? 'active-slide  py-75' : ' py-75'}`}>
          {slide.content}
        </div>
      ))}
    </Slider>
  );
};

export default Carousel;
