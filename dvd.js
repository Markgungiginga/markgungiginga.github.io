        const dvd = document.getElementById('dvd');
        let x = 0;
        let y = 0;
        let dx = 2;
        let dy = 2;
        let width = dvd.offsetWidth;
        let height = dvd.offsetHeight;
        
        // Начальная позиция
        x = Math.random() * (window.innerWidth - width);
        y = Math.random() * (window.innerHeight - height);
        
        // Начальный цвет
        let hue = 0;
        
        function updatePosition() {
            // Проверка столкновения с границами
            if (x + width >= window.innerWidth || x <= 0) {
                dx = -dx;
           
            }
            
            if (y + height >= window.innerHeight || y <= 0) {
                dy = -dy;

            }
            
            // Обновление позиции
            x += dx;
            y += dy;
            
            // Применение новой позиции
            dvd.style.left = x + 'px';
            dvd.style.top = y + 'px';
            
            // Продолжение анимации
            requestAnimationFrame(updatePosition);
        }
        
        function changeColor() {
            hue = (hue + 30) % 360;
            dvd.style.backgroundColor = `hsl(${hue}, 100%, 50%)`;
        }
        
        // Обработка изменения размера окна
        window.addEventListener('resize', () => {
            // Если элемент выходит за границы после изменения размера
            if (x + width > window.innerWidth) x = window.innerWidth - width;
            if (y + height > window.innerHeight) y = window.innerHeight - height;
        });
        
        // Запуск анимации
        updatePosition();