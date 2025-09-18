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

AUTOPLAY()

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

const audio = document.getElementById("myAudio");
	audio.volume = 0.3

function AUTOPLAY() {
	const audio = document.getElementById("myAudio");
	if (audio.paused) {
		audio.volume = 0.15;
		audio.play().catch(e => console.error("Автовоспроизведение заблокировано"));
	}
}
const canvas = document.getElementById('strobe');
const ctx = canvas.getContext('2d');

// Настройки BPM (126)
const BPM = 126;
const beatInterval = (60 / BPM) * 1000;

// Настройки прожекторов
const config = {
	beamWidth: 10,
	fadeStart: 0.6,  // Увеличено для более длинных лучей
	fadeEnd: 0.98,   // Почти до конца экрана
	colors: [
		'#FF0066', '#00FFAA',
		'#AA00FF', '#FFAA00',
		'#00CCFF', '#FF00CC',
		'#00FF77', '#FF7700'
	],
	beamsPerCorner: 4,
	horizontalRange: [0.05, 0.45],  // +20% шире чем было
	verticalRange: [0.4, 0.9]       // Больше покрытия по вертикали
};

// Инициализация прожекторов
const beams = [];
let lastBeatTime = 0;

function init() {
	resizeCanvas();
	createBeams();
	animate();
	window.addEventListener('resize', resizeCanvas);
}

function resizeCanvas() {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	createBeams();
}

function createBeams() {
	beams.length = 0;

	// Левый верхний угол (4 прожектора)
	for (let i = 0; i < config.beamsPerCorner; i++) {
		beams.push({
			source: { x: 0, y: 0 },
			currentTarget: getRandomTarget(true),
			nextTarget: getRandomTarget(true),
			progress: 0,
			color: config.colors[i % config.colors.length]
		});
	}

	// Правый верхний угол (4 прожектора)
	for (let i = 0; i < config.beamsPerCorner; i++) {
		beams.push({
			source: { x: canvas.width, y: 0 },
			currentTarget: getRandomTarget(false),
			nextTarget: getRandomTarget(false),
			progress: 0,
			color: config.colors[(i + 4) % config.colors.length]
		});
	}
}

function getRandomTarget(isLeft) {
	const hRange = config.horizontalRange;
	const vRange = config.verticalRange;

	return {
		x: isLeft
			? canvas.width * (hRange[0] + Math.random() * hRange[1])
			: canvas.width * (1 - hRange[0] - hRange[1] + Math.random() * hRange[1]),
		y: canvas.height * (vRange[0] + Math.random() * (vRange[1] - vRange[0]))
	};
}

function updateTargets() {
	beams.forEach(beam => {
		beam.currentTarget = { ...beam.nextTarget };
		beam.nextTarget = getRandomTarget(beam.source.x === 0);
		beam.progress = 0;

		// Случайная смена цвета
		if (Math.random() > 0.7) {
			beam.color = config.colors[Math.floor(Math.random() * config.colors.length)];
		}
	});
}

function drawBeam(beam) {
	// Плавное движение между целями
	const target = {
		x: beam.currentTarget.x +
			(beam.nextTarget.x - beam.currentTarget.x) * beam.progress,
		y: beam.currentTarget.y +
			(beam.nextTarget.y - beam.currentTarget.y) * beam.progress
	};

	// Автоматическое удлинение лучей к краям
	const dx = target.x - beam.source.x;
	const dy = target.y - beam.source.y;
	const distance = Math.sqrt(dx * dx + dy * dy);
	const direction = { x: dx / distance, y: dy / distance };

	// Удлиняем луч на 20% если он направлен в сторону
	const endPoint = {
		x: target.x + direction.x * distance * 0.2,
		y: target.y + direction.y * distance * 0.2
	};

	// Рисуем луч
	const gradient = ctx.createLinearGradient(
		beam.source.x, beam.source.y,
		endPoint.x, endPoint.y
	);
	gradient.addColorStop(0, beam.color);
	gradient.addColorStop(config.fadeStart, beam.color);
	gradient.addColorStop(config.fadeEnd, `${beam.color}00`);

	ctx.strokeStyle = gradient;
	ctx.lineWidth = config.beamWidth;
	ctx.lineCap = 'round';
	ctx.beginPath();
	ctx.moveTo(beam.source.x, beam.source.y);
	ctx.lineTo(endPoint.x, endPoint.y);
	ctx.stroke();

	// Свечение
	ctx.shadowColor = beam.color;
	ctx.shadowBlur = 30;
	ctx.stroke();
	ctx.shadowBlur = 0;
}

function animate(timestamp) {
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	// BPM-контроль
	if (!lastBeatTime || timestamp - lastBeatTime > beatInterval) {
		lastBeatTime = timestamp;
		updateTargets();
	}

	// Обновляем прогресс анимации
	const progressStep = 0.005 * (BPM / 120);
	beams.forEach(beam => {
		beam.progress = Math.min(beam.progress + progressStep, 1);
	});

	// Рисуем все лучи
	beams.forEach(beam => drawBeam(beam));

	requestAnimationFrame(animate);
}

init();
let num = 42
const error = document.getElementById("Error")
const resultElement = document.getElementById("result")
const input1 = document.getElementById("input1")
const input2 = document.getElementById("input2")
const submitBtn = document.getElementById("submit")
const plusBtn = document.getElementById("plus")
const minusBtn = document.getElementById("minus")
const multiplyBtn = document.getElementById("multiply")
const divideBtn = document.getElementById("divide")
// console.log (resultElement.textContent)
// resultElement.textContent = 
plusBtn.onclick = function () {
    action = "+"
}
minusBtn.onclick = function () {
    action = "-"
}
multiplyBtn.onclick = function () {
    action = "*"
}
divideBtn.onclick = function () {
    action = "/"
}

function printResult(result) {
    if (result < 0) {
        resultElement.style.color = "red"
    } else {
        resultElement.style.color = "green"
    }
    resultElement.textContent = result
}

function computeNumbersWithActions (inp1, inp2, actionSymbol) {
    const num1 = Number(inp1.value)
    const num2 = Number(inp2.value)
    if (actionSymbol == "+") { 
        return num1 + num2
    } else if (actionSymbol == "-") {
        return num1 - num2
    } else if (actionSymbol == "*") {
        return num1 * num2
    } else if (actionSymbol == "/") {
        return num1 / num2
    }
	}
function GIGABRAINFUCK(result){
	switch (result.toString()) {
		case ("Infinity"):
		launchAirplane();
		return "БЕСКОНЕЧНО ВЕЧНОЕ ПРЕКРАСНО ПОСТОЯННОЕ";
		case ("0"):
		launchAirplane();
		return "Нолик почини меня"
		case ("NaN"):
		launchAirplane();
		return "Тебе должно быть стыдно за свои действия"
		default: return result
	}
}
submitBtn.onclick = function () {
    let result = computeNumbersWithActions (input1, input2, action)
	result = GIGABRAINFUCK(result)
    printResult(result)
}
function launchAirplane() {
    const img = document.getElementById('airplaneVideo');
	img.src = img.src;
    img.classList.remove('airplane-crashing');
	void img.offsetWidth;
    img.classList.add('airplane-crashing');
	new Audio('audio/Jet crash on green screen [WxF-lwPkpvc] (audio-extractor.net).mp3').play();
	// пиздец
}