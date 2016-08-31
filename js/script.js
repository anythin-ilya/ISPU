var posX, posY;//Точка для элементов по одной точке, или последняя точка, если элемент строиться более чем по одной точке.
var first_point = {};//Первая точка(для элементов по 2м точкам)
var second_point = {};//Вторая точка(для элементов по 3м точкам)
drawing = SVG("drawing").size('100%', 600);//Поле для рисования DRAWING
var typeline = "";//Тип линии
//var style = "slim";//Стиль линии
var color = "black";//Цвет линии
var object = [];//Массив объектов(прямая, окружность и т.д.)
var dots = [];//Массив точек для привязки
var size = [];//Массив размеров
var jObject = -1 ;//Храни индекс массива object для последнего выбранного объекта
var jObject2 = -1;//храним индекс массива object для предпосленденго выбранного объекта
var jSize2 = -1;//Храни индекс массива size для предпоследнего выбранного объекта
var jSize = -1;//Храни индекс массива size для последнего созданного размера
var btn_groups;
var start = 0;
var drawingAdress = $("#drawing");
var name1;
var text1;
var positionX, positionY;
var firstUse=0;//Если jObject1 ещё не определено для parallel и normal.
var jObject1 = -1;//Храние значение jObject для параллельной и перпендикулярной прямой для сохранения индекса предыдущего выбранного объекта
var numberOfObjects = 0;//Номер последнего элемента массива объектов
var numberOfSize = 0;//Номер последнего элемента массива размеров
var typeDelete ="";
var typeOfLine ="";
var typeOfHatch ="slim";//тип рисуемой линии(штриховая, толстая...)
var widthOfLine=1;//толщина рисуемой линии
//var buttonSetting= false;//
var control = false;
var forDrawInMenu = false;
var obrabotka = 0;
var forElastic;//для вспомогательгого объекта
var action = true;//показывает выбрана ли операция

drawingAdress.on('mousemove', viewCoord);

$(document).ready(function () {
    document.getElementById('circleSetting').setAttribute("style", "display: none");
    //drawingAdress.on('click', drawClickObject)//Сразу запускаем обработчик клика по полю
    btn_groups = $('.main-container-btn');
    btn_groups.hover(_hoverEvent);
    viewCoord(e);
    currentAction();


});

function SaveOnServer(){
    arrayForServer=[];//массив для отправки
    i=0;
    for(i = 0; i < object.length; i++) {
        arrayForServer.push({//заполняем массив для отправки на сервер
            name: object[i].name,//Хранит значение подписи объекта.
            objectType:object[i].objectType,//Переменная, которая хранит тип объекта.
            //"type": object[i].type,//Ссылка на невидимый кликабельный фон объекта.
            x1: object[i].x1,//Координата X элемента "точка", координата Х для вертикальной прямой, первая выбранная точка линии, координата Х центра окружности.
            y1: object[i].y1,//Координата Y для горизонтальной прямой, координата Y центра окружности.
            x2: object[i].x2,//Координата X вертикальной прямой, вторая выбранная точка линии, координата Х левой точки привязки окруности.
            y2: object[i].y2,//Координата Y горизонтальной прямой, координата Y левой точки привязки окружности.
            x3: object[i].x3,//Координата Х верхней точки привязки окружности.
            y3: object[i].y3,//Координата Y верхней точки привязки окружности.
            x4: object[i].x4,//Координата Х правой точки привязки окружности.
            y4: object[i].y4,//Координата Y правой точки привязки к окружности.
            midX: object[i].midX,//Координата Х нижней точки привязки окружности, координата Х центра отрезка.
            midY: object[i].midY,//Координата Y нижней точки привязки к окружности, координата Y центра отрезка.
            tangentX: -1,
            tangentY: -1,
            R: object[i].R,//Радиус окружности.
            A: object[i].A,//Коэффициент А общего уравнения прямой.
            B: object[i].B,//Коэффициент В общего уравнения прямой.
            C: object[i].C,//Коэффициент С общего уравнения прямой.
            //"visibleObject": object[i].visibleObject,//Ссылка на видимый нарисованный объект.
            //"text": object[i].text,//Ссылка на подпись объекта.
            colorObj: object[i].color,
            typeLineObj: object[i].typeLineObj})
    }
    for(i = 0; i < size.length; i++) {
        arrayForServer.push({
            //НУЖНО ДРУГОЙ ВАРИАНТ СОХРАНЕНИЯ РАЗМЕРОВ

        })
    }
    var result = {code:JSON.stringify(arrayForServer)};//преобразуем данные в json структуру
    $.post("http://webtute.ru/editor.php?a=store&id=3", result, function (json) { alert (json); },
        'json');//заливаем эти данные на сервак


}

function LoadFromServer(){
    $.get("http://webtute.ru/editor.php?id=3", {},
        function (json) {alert(json.length)
            for(i = 0; i < json.length; i++) {
                alert(json[i].x1);
                c = drawing.line(json[i].x1, json[i].y1, json[i].x2, json[i].y2).stroke({
                    width: widthOfLine,//ДОПИСАТЬ
                    color: json[i].color,
                    dasharray: typeOfLine//ДОПИСАТЬ
                });
                a = drawing.line(json[i].x1, json[i].y1, json[i].x2, json[i].y2).stroke({
                    width: 10,
                    color: 'transparent'
                });
                var text1 = drawing.text(function (add) {
                    add.tspan(json[i].name).fill(color).dx(1).dy(1);})

                object.push({
                    name: json[i].name,//Хранит значение подписи объекта.
                    objectType:json[i].objectType,//Переменная, которая хранит тип объекта.
                    type: a,//Ссылка на невидимый кликабельный фон объекта.
                    x1: json[i].x1,//Координата X элемента "точка", координата Х для вертикальной прямой, первая выбранная точка линии, координата Х центра окружности.
                    y1: json[i].y1,//Координата Y для горизонтальной прямой, координата Y центра окружности.
                    x2: json[i].x2,//Координата X вертикальной прямой, вторая выбранная точка линии, координата Х левой точки привязки окруности.
                    y2: json[i].y2,//Координата Y горизонтальной прямой, координата Y левой точки привязки окружности.
                    x3: json[i].x3,//Координата Х верхней точки привязки окружности.
                    y3: json[i].y3,//Координата Y верхней точки привязки окружности.
                    x4: json[i].x4,//Координата Х правой точки привязки окружности.
                    y4: json[i].y4,//Координата Y правой точки привязки к окружности.
                    midX: json[i].midX,//Координата Х нижней точки привязки окружности, координата Х центра отрезка.
                    midY: json[i].midY,//Координата Y нижней точки привязки к окружности, координата Y центра отрезка.
                    tangentX: -1,
                    tangentY: -1,
                    R: json[i].R,//Радиус окружности.
                    A: json[i].A,//Коэффициент А общего уравнения прямой.
                    B: json[i].B,//Коэффициент В общего уравнения прямой.
                    C: json[i].C,//Коэффициент С общего уравнения прямой.
                    visibleObject: c,//Ссылка на видимый нарисованный объект.
                    text: text1,//Ссылка на подпись объекта.
                    //colorObj: json[i].color,
                    typeLineObj: json[i].typeLineObj});

                touchObject(i);
                numberOfObjects++;

            }


        }
    );
    //alert(object[0].x1);



}

function transformFromMachineToUser(y){
    y=-1*y+drawingAdress.height();
    return y;
}//Функция, переводящая системную систему координат в пользовательскую(декартову).

function getCross(jObject, jObject2) {
    var yCross = ((object[jObject2].A * object[jObject].C)/object[jObject].A - object[jObject2].C)/(object[jObject2].B - ((object[jObject2].A * object[jObject].B)/object[jObject].A));//Высчитывает точку пересечения в пользовательских координатах.
    var xCross = (-object[jObject].B*yCross-object[jObject].C)/object[jObject].A;
    var cross={X:xCross,Y:yCross};
    return cross;
}//Нахождение точки пересечения прямых. Возвращает Y в пользовательских координатах.

function transformFromUserToMachine(y){
    y=(y-drawingAdress.height())/-1;
    return y;
}

function viewCoord(e){
    xx = e.pageX - drawingAdress.offset().left;
    yy = transformFromMachineToUser(e.pageY-drawingAdress.offset().top)//переворот оси Y за счёт -1, перенос оси Y в левый нижний угол за счёт добавления высоты поля.
    document.getElementById('positionCursor').innerHTML='Coord X = '+ xx + ' ' + 'Coord Y = '+ yy;
}//Вывод текущей координаты в строку подсказок.

function settings(i){//выводит параметры данного объекта на экран в формы

    document.getElementById('typeObj').innerHTML = object[i].objectType;//устанавливаем значение типа объекта в input
    document.getElementById('nameObject').value = object[i].name;//устанавливаем значение имя объекта в input

    if(object[i].objectType == ("line")) {//если тип выбранного объекта линия

        document.getElementById('lineSetting').setAttribute("style", "display: block");//показываем настройки линий
        document.getElementById('circleSetting').setAttribute("style", "display: none");//убираем настройки окружности
        document.getElementById('firstPointx').value = object[i].x1;//устанавливаем значение х точки 1 в input
        document.getElementById('secondPointx').value = object[i].x2;//устанавливаем значение х точки 2 в input
        document.getElementById('firstPointy').value = transformFromMachineToUser(object[i].y1);//устанавливаем значение у точки 1 в input
        document.getElementById('secondPointy').value = transformFromMachineToUser(object[i].y2);//устанавливаем значение у точки 2 в input

    }
    else if (object[i].objectType == "circle"){//если тип выбранного объекта окружность

        document.getElementById('lineSetting').setAttribute("style", "display: none");//убираем настройки линий
        document.getElementById('circleSetting').setAttribute("style", "display: block");//показываем настройки линий
        document.getElementById('circlePointx').value = object[i].x1;//устанавливаем значение х точки радиуса в input
        document.getElementById('circlePointy').value = transformFromMachineToUser(object[i].y1);//устанавливаем значение у точки радиуса в input
        document.getElementById('meaningR').value = object[i].R;//устанавливаем значение радиуса в input

    }

    document.getElementById('rightMenuColor').value = object[i].colorObj;//устанавливаем значение цвета в input раскрывающийся
    document.getElementById('rightMenuType').value = object[i].typeLineObj;//устанавливаем значение типа в input раскрывающийся

    jObject=i;//меняем номер последнего элемента
}

function drawSetting(){//функция изменения значений прямых после изменения в input
    console.log(jObject);
    typeline = object[jObject].objectType;//устанавливаем значение тип линии
    if(typeline == "line"){
        object[jObject].name = document.getElementById('nameObject').value;//присваиваем имя объекту после изменения в input
        first_point.x = document.getElementById('firstPointx').value;//присваиваем значение точке х для рисования
        first_point.y = transformFromUserToMachine(document.getElementById('firstPointy').value);//присваиваем значение точке у для рисования
        posX = document.getElementById('secondPointx').value;//присваиваем значение точке х для рисования
        posY = transformFromUserToMachine(document.getElementById('secondPointy').value);//присваиваем значение точке у для рисования
        object[jObject].typeLineObj = document.getElementById('rightMenuType').value;//присвоить объекту значение тип линии
    }
    else if(typeline == "circle" ){
        object[jObject].name = document.getElementById('nameObject').value;//присваиваем имя объекту после изменения в input
        first_point.x = document.getElementById('circlePointx').value;//присваиваем значение точке х для рисования
        first_point.y = transformFromUserToMachine(document.getElementById('circlePointy').value);//присваиваем значение точке y для рисования
        object[jObject].R = document.getElementById('meaningR').value;//присваиваем значение радиусу
        object[jObject].typeLineObj = document.getElementById('rightMenuType').value;//присвоить объекту значение тип линии

    }
    color = document.getElementById('rightMenuColor').value;
    setstyle(object[jObject].typeLineObj);
    object[jObject].text.remove();
    object[jObject].type.remove();
    object[jObject].visibleObject.remove();
    console.log(jObject);
    drawAll();
}

function currentAction(){
    document.getElementById('operation').innerHTML='Текущая операция = ' + typeline;
    if(!forDrawInMenu && (obrabotka == 0 || obrabotka ==1  )){
        obrabotka += 1;//хз зачем это
        if(action){//если выбрана операция то клик по полю не навешиваем, а то будет 2 клика
            drawingAdress.on('click', drawClickObject);
            action = false;
        }

    }
}

function elastic(e){
    if(typeline=="line" || typeline == "simpleline"){
        positionX = e.pageX - drawingAdress.offset().left;
        positionY = e.pageY - drawingAdress.offset().top;
        if(forElastic)//если какой-то объект есть в переменной
            forElastic.remove();
        forElastic = drawing.line(first_point.x, first_point.y, positionX, positionY).stroke({
            width: widthOfLine,
            color: color,
            dasharray: typeOfLine
        });
    }
    else if(typeline == "circle"){
        //alert("All good");

        positionX = e.pageX - drawingAdress.offset().left;
        positionY = e.pageY - drawingAdress.offset().top;
        r = Math.sqrt(Math.pow(positionX - first_point.x, 2) + Math.pow(positionY - first_point.y, 2));//чтобы много раз не считать радиус
        if(forElastic)//если какой-то объект есть в переменной
            forElastic.remove();
        forElastic = drawing.circle(r * 2).x(first_point.x - r).y(first_point.y - r).fill('none').stroke({
            width: widthOfLine,
            color: color,
            dasharray:typeOfLine
        });
    }

}

function addTheSize(value1, a, fNormal, sNormal, statText, b, visFNormal, visSNormal) {//Добавление размера в массив размеров (size)
    size.push({
        value: value1,//значение над размером
        objectType: typeline,//тип размера
        line: a,//двусторонняя стрелка невидимая
        firstNormal: fNormal,//одна из перпендикулярных линий невидимая
        secondNormal: sNormal,//вторая из перпендикулярных линий невидимая
        text: statText,//текст перемещения
        lineVisible : b,//двусторонняя стрелка видимая
        visibleFNormal: visFNormal,//одна из перпендикулярных линий видимая
        visibleSNormal: visSNormal//одна из перпендикулярных линий видимая

    })
}//Добавление элемента в массив размеров

function addTheElement(typeObj, name1, a, statx1, staty1, statx2, staty2, statx3, staty3, statx4, staty4, statx5, staty5, statR, statA, statB, statC, statt, statText) {//Добавление объекта в массив объектов (object)
    object.push({
        name: name1,//Хранит значение подписи объекта.
        objectType: typeObj,//Переменная, которая хранит тип объекта.
        type: a,//Ссылка на невидимый кликабельный фон объекта.
        x1: statx1,//Координата X элемента "точка", координата Х для вертикальной прямой, первая выбранная точка линии, координата Х центра окружности.
        y1: staty1,//Координата Y для горизонтальной прямой, координата Y центра окружности.
        x2: statx2,//Координата X вертикальной прямой, вторая выбранная точка линии, координата Х левой точки привязки окруности.
        y2: staty2,//Координата Y горизонтальной прямой, координата Y левой точки привязки окружности.
        x3: statx3,//Координата Х верхней точки привязки окружности.
        y3: staty3,//Координата Y верхней точки привязки окружности.
        x4: statx4,//Координата Х правой точки привязки окружности.
        y4: staty4,//Координата Y правой точки привязки к окружности.
        midX: statx5,//Координата Х нижней точки привязки окружности, координата Х центра отрезка.
        midY: staty5,//Координата Y нижней точки привязки к окружности, координата Y центра отрезка.
        tangentX: -1,
        tangentY: -1,
        R: statR,//Радиус окружности.
        A: statA,//Коэффициент А общего уравнения прямой.
        B: statB,//Коэффициент В общего уравнения прямой.
        C: statC,//Коэффициент С общего уравнения прямой.
        visibleObject: statt,//Ссылка на видимый нарисованный объект.
        text: statText,//Ссылка на подпись объекта.
        colorObj: color,
        typeLineObj: typeOfHatch,

    })
}//ДОбавление элемента в массив объектов

var drawClickObject = function (e) {//проверка на первый и второй клик по полю

    console.log("drawClickObject")
    console.log("PosX = " + posX + "PosY = " + posY + "FPx = " + first_point.x + "FPy = " + first_point.y);
    if (typeline != 'horizontalSize' && typeline != 'verticalSize' && typeline != 'angularSize' && typeline!= 'angleSize') {
        positionX = e.pageX - drawingAdress.offset().left;
        positionY = e.pageY - drawingAdress.offset().top;
        //console.log("positionX: " + positionX + "   positionY: " + positionY);
        if (first_point.x && first_point.y) {//Елси уже было нажатие по 1 точке, то присваиваем значение, по которому кликнули второй точке
            posX = positionX;
            posY = positionY;
            console.log("я в дравол пошел")

            //console.log('уходит в рисование по 2 точкам')
            drawAll();//Уходим в рисование объектов по 2м точкам.
        }
        else {
            first_point = {x: positionX, y: positionY};
            if (typeline == 'unvisibleDot' || typeline == 'visibleDot' || typeline == 'horizontalLine' || typeline == 'verticalLine' || typeline == 'normal' || typeline == 'parallel' || typeline == 'circleR')
            {
                drawAll();
            }//Уходим в рисование объектов по 1 точке.
            else if (typeline == "line" || typeline == "circle"){//для этих объектов резинка
                drawingAdress.on('mousemove', elastic);//включаем резинку
            }


        }
        if (snapEnd) {
            snapEnd = false;
        }
    }
}/*Обработчик клика по полю.*/

function drawNormalSize(e) {
    console.log("drawNormalSize")
    var a;//невидимая прямая
    var a1;//видимая прямая
    var vert1;//невидимая прямая
    var vert2;//невидимая прямая
    var vert1Visible;//видимая прямая
    var vert2Visible;//видимая прямая
    if (start == 1) {
        console.log("start=1, происходит изменение положения размера");
        console.log(first_point.x)
        console.log(first_point.y)
        console.log(posX)
        console.log(posY)
        if(((e.pageX - drawingAdress.offset().left < first_point.x) && (e.pageX - drawingAdress.offset().left > posX))||((e.pageX - drawingAdress.offset().left > first_point.x) && (e.pageX - drawingAdress.offset().left < posX))){
            size[numberOfSize].text.remove();
            console.log(numberOfSize);
            var dyy = (e.pageY - drawingAdress.offset().top);//Текущая координата Y для текста
            if ((e.pageY - drawingAdress.offset().top) >= posY) {//курсор находится ниже posY

                size[numberOfSize].visibleSNormal.plot(posX, posY, posX, (e.pageY - drawingAdress.offset().top) + 20);
                size[numberOfSize].secondNormal.plot(posX, posY, posX, (e.pageY - drawingAdress.offset().top) + 20);
            }
            else {

                size[numberOfSize].visibleSNormal.plot(posX, posY, posX, (e.pageY - drawingAdress.offset().top) - 20);
                size[numberOfSize].secondNormal.plot(posX, posY, posX, (e.pageY - drawingAdress.offset().top) - 20);
            }
            if ((e.pageY - drawingAdress.offset().top) >= first_point.y) {//позиция курсора ниже firspoint.y

                size[numberOfSize].visibleFNormal.plot(first_point.x, first_point.y, first_point.x, (e.pageY - drawingAdress.offset().top) + 20);
                size[numberOfSize].firstNormal.plot(first_point.x, first_point.y, first_point.x, (e.pageY - drawingAdress.offset().top) + 20);
            }
            else {

                size[numberOfSize].visibleFNormal.plot(first_point.x, first_point.y, first_point.x, (e.pageY - drawingAdress.offset().top) - 20);
                size[numberOfSize].firstNormal.plot(first_point.x, first_point.y, first_point.x, (e.pageY - drawingAdress.offset().top) - 20);
            }
            size[numberOfSize].lineVisible.plot(first_point.x, ((e.pageY - drawingAdress.offset().top)), posX, ((e.pageY - drawingAdress.offset().top)));
            size[numberOfSize].line.plot(first_point.x, ((e.pageY - drawingAdress.offset().top)), posX, ((e.pageY - drawingAdress.offset().top)));

            size[numberOfSize].text = drawing.text(function (add) {
                add.tspan(name1).dx((first_point.x + posX) / 2).dy(dyy - 15);
            });
        }
        else{
            size[numberOfSize].text.remove();
            var ddx = e.pageX - drawingAdress.offset().left;//Текущая координата X для текста
            if (e.pageX - drawingAdress.offset().left >= posX) {//курсор находится правее posX

                size[numberOfSize].visibleSNormal.plot(posX, posY, (e.pageX - drawingAdress.offset().left) + 20, posY);
                size[numberOfSize].secondNormal.plot(posX, posY, (e.pageX - drawingAdress.offset().left) + 20, posY);
            }
            else {

                size[numberOfSize].visibleSNormal.plot(posX, posY, (e.pageX - drawingAdress.offset().left) - 20, posY);
                size[numberOfSize].secondNormal.plot(posX, posY, (e.pageX - drawingAdress.offset().left) - 20, posY);
            }
            if (e.pageX - drawingAdress.offset().left >= first_point.x) {//курсор находится правее firstpoint.x

                size[numberOfSize].visibleFNormal.plot(first_point.x, first_point.y, (e.pageX - drawingAdress.offset().left) + 20, first_point.y);
                size[numberOfSize].firstNormal.plot(first_point.x, first_point.y, (e.pageX - drawingAdress.offset().left) + 20, first_point.y);
            }
            else {

                size[numberOfSize].visibleFNormal.plot(first_point.x, first_point.y, (e.pageX - drawingAdress.offset().left) - 20, first_point.y);
                size[numberOfSize].firstNormal.plot(first_point.x, first_point.y, (e.pageX - drawingAdress.offset().left) - 20, first_point.y);
            }


            size[numberOfSize].lineVisible.plot(((e.pageX - drawingAdress.offset().left)), first_point.y, ((e.pageX - drawingAdress.offset().left)), posY);
            size[numberOfSize].line.plot(((e.pageX - drawingAdress.offset().left)), first_point.y, ((e.pageX - drawingAdress.offset().left)), posY);
            size[numberOfSize].text = drawing.text(function (add) {
                add.tspan(name1).fill('green').dx(ddx - 30).dy((posY + first_point.y) / 2);
            }).rotate(-90);
        }
    }
    if (start == 0) {
        a1 = drawing.line(0, 0, 0, 0).stroke({//Горизонтальная прямая (между перпендикулярами
            width: 1,
            color: 'green',
        });
        a = drawing.line(0, 0, 0, 0).stroke({//Горизонтальная прямая (между перпендикулярами
            width: 10,
            color: 'transparent',
        });


        a1.marker('start', 20, 20, function (add) {//рисуем стрелку начала
            add.polyline('0,10 20,5 10,10 20,15 0,10').fill('green');
            add.ref(0, 10);
        }).marker('end', 30, 30, function (add) {//рисуем стрелку конца
            add.polyline('20,10 0,5 10,10 0,15 20,10').fill('green');
            add.ref(20, 10);
        });

        vert1Visible = drawing.line(110, 110, 1, 1).stroke({//Перпендиуляр
            width: 1,
            color: 'green',
        })
        vert2Visible = drawing.line(110, 111, 1, 1).stroke({//Перпендикуляр
            width: 1,
            color: 'green',
        })

        vert1 = drawing.line(110, 110, 1, 1).stroke({//Перпендиуляр
            width: 10,
            color: 'transparent',
        })
        vert2 = drawing.line(110, 111, 1, 1).stroke({//Перпендикуляр
            width: 10,
            color: 'transparent',
        })

        //text = drawing.plain(name1);
        text1 = drawing.text(function (add) {//Создание подписи
            add.tspan(name1).fill('green');
            add.font({
                family: 'gostbu'
            })
        })
        addTheSize(name1, a, vert1, vert2, text1, a1, vert1Visible, vert2Visible);//Добавление в массив размеров

    }
    start = 1;
}//Рисуем обычные размеры

function drawAngularSize(e){
    console.log("drawAngularSize")
    var a;//невидимая прямая
    var a1;//видимая прямая
    var vert1;//невидимая прямая
    var vert2;//невидимая прямая
    var vert1Visible;//видимая прямая
    var vert2Visible;//видимая прямая
    var ddx = e.pageX - drawingAdress.offset().left;//Текущая координата по оси Х.
    var ddy = e.pageY - drawingAdress.offset().top;//Текущая координата по оси Y.
    var k1 = object[jObject].A / object[jObject].B;//Без минуса, так как ось Y инвертирована. Коэффициент выбранной прямой.
    var k = -1 / (object[jObject].A / object[jObject].B);//Угловой коэффициент прямой, перпендикулярной данной
    var b = first_point.y - first_point.x * k1;//Коэффициент b для выбранной прямой
    var b1 = (e.pageY - drawingAdress.offset().top) - (e.pageX - drawingAdress.offset().left) * k;//Определяем b перпендикуляра из текущего положения мыши.
    var dx = ddx - ((b - b1) / (k - k1));//Смещение по X
    var dy = ddy - (k * ((b - b1) / (k - k1)) + b1);//Смещение по Y
    var angle = Math.atan(1 / k) * 180 / Math.PI;//Получаем угол наклона прямой в градусах.
    var cosinus = Math.cos(Math.atan(1 / k));
    var sinus = Math.sin(Math.atan(1 / k));
    if (start == 1) {
        size[numberOfSize].text.remove();
        size[numberOfSize].lineVisible.plot(first_point.x + dx, first_point.y + dy, posX + dx, posY + dy);
        size[numberOfSize].line.plot(first_point.x + dx, first_point.y + dy, posX + dx, posY + dy);
        size[numberOfSize].visibleFNormal.plot(first_point.x, first_point.y, first_point.x + dx + (dx / Math.sqrt(dx * dx + dy * dy) * 20), first_point.y + dy + (dy / Math.sqrt(dx * dx + dy * dy) * 20));
        size[numberOfSize].firstNormal.plot(first_point.x, first_point.y, first_point.x + dx + (dx / Math.sqrt(dx * dx + dy * dy) * 20), first_point.y + dy + (dy / Math.sqrt(dx * dx + dy * dy) * 20));
        size[numberOfSize].visibleSNormal.plot(posX, posY, posX + dx + (dx / Math.sqrt(dx * dx + dy * dy) * 20), posY + dy + (dy / Math.sqrt(dx * dx + dy * dy) * 20));
        size[numberOfSize].secondNormal.plot(posX, posY, posX + dx + (dx / Math.sqrt(dx * dx + dy * dy) * 20), posY + dy + (dy / Math.sqrt(dx * dx + dy * dy) * 20));

        size[numberOfSize].text = drawing.text(function (add) {
            add.tspan(name1).fill('green').dx((first_point.x + dx + posX + dx) / 2 - 15 * sinus)
                .dy((first_point.y + dy + posY + dy) / 2 - 15 * cosinus);
        }).rotate(-angle);
    }
    if (start == 0) {
        a = drawing.line(0, 0, 0, 0).stroke({
            width: 10,
            color: 'transparent',
        })
        a1 = drawing.line(0, 0, 0, 0).stroke({
            width: 1,
            color: 'green',
        })
        a1.marker('start', 20, 20, function (add) {//рисуем стрелки начала
            add.polyline('0,10 20,5 10,10 20,15 0,10').fill('green');
            add.ref(0, 10);
        }).marker('end', 30, 30, function (add) {//рисуем стрелки конца
            add.polyline('20,10 0,5 10,10 0,15 20,10').fill('green');
            add.ref(20, 10);
        });
        vert1 = drawing.line(0, 0, 0, 0).stroke({//перпендикуляр
            width: 10,
            color: 'transparent',
        });
        vert2 = drawing.line(0, 0, 0, 0).stroke({//перпендикуляр
            width: 10,
            color: 'transparent',
        });
        vert1Visible = drawing.line(0, 0, 1, 1).stroke({//Перпендиуляр
            width: 1,
            color: 'green',
        })
        vert2Visible = drawing.line(0, 1, 1, 1).stroke({//Перпендикуляр
            width: 1,
            color: 'green',
        })
        text1 = drawing.text(function (add) {
            add.tspan(name1).fill('green');
        });
        addTheSize(name1, a, vert1, vert2, text1 , a1, vert1Visible, vert2Visible);
        start = 1;
    }
}//Рисуем наклонённые размеры

function drawAngleSize(e){
    console.log("drawAngleSize");
    var a;//невидимая прямая
    var a1;//видимая прямая
    var vert1;//невидимая прямая
    var vert2;//невидимая прямая
    var vert1Visible;//видимая прямая
    var vert2Visible;//видимая прямая
    var deltaX1;
    var deltaX2;
    var deltaY1;
    var deltaY2;
    var midX0;//координаты подписи
    var midY0;
    var xCross;//точки пересечения
    var yCross;
    var k3;
    var b3;
    var currentPart;//true когда II и IV четверть иначе I и III,чтобы линия стрелка отображалась корректно в 2 и 4 областях
    var k1 = object[jObject].A / object[jObject].B;//коэффициенты двух прямых
    var k2 = object[jObject2].A / object[jObject2].B;
    var pagex = e.pageX - drawingAdress.offset().left;
    var pagey = e.pageY - drawingAdress.offset().top;
    console.log(k1 + " - " + k2);
    if (k1 > 1000 || k1 < - 1000){//если первая прямая - вертикальная
        k1 = 10000;//если не изменить, то коэффициент будет инфинити
        xCross = object[jObject].x1;//тк вертикальная прямая
        yCross = k2 * xCross + (object[jObject2].y1 - object[jObject2].x1 * k2);//пересчет
    }
    else if (k2 > 1000 || k2 < - 1000){//если вторая прямая - вертикальная
        k2 = 10000;//если не изменить, то коэффициент будет инфинити
        xCross = object[jObject2].x1;//тк вертикальная прямая
        yCross = k1 * xCross + (object[jObject].y1 - object[jObject].x1 * k1);
    }
    else {//если нет вертикальных прямых
        xCross = ((object[jObject2].y1 - object[jObject2].x1 * k2) - (object[jObject].y1 - object[jObject].x1 * k1)) / (k1 - k2);//находим х точки пересечения прямых
        yCross = k1 * xCross + (object[jObject].y1 - object[jObject].x1 * k1);                                                 //находим у точки пересечения прямых
    }
    //alert("xCross= "+ xCross + "yCross= " + yCross + "pageX= " + pagex + "pageY= " + pagey);

    var d = Math.sqrt(Math.pow((pagey - yCross ), 2) + Math.pow((pagex - xCross),2));//определили расстояние до точки пересечения от курсора
    console.log("Д равно " + d);
    var b1 =  yCross - k1 * xCross;
    var b2 =  yCross - k2 * xCross;
    if((k1 * (xCross + 1) + b1) > (k2 * (xCross + 1) + b2)){//определяем верхнюю справа прямую
        var k3 = k1;
        k1 = k2;
        k2 = k3;
        k3 = b1;
        b1 = b2;
        b2 = k3;
    }
    if ((pagey <= k2 * pagex + b2) && (pagey >= k1 * pagex + b1)){//I part
        console.log('first')
        currentPart = false;//true когда II и IV четверть иначе I и III,чтобы линия стрелка отображалась корректно в 2 и 4 областях
        deltaX1 = xCross + Math.cos(Math.atan(k1)) * d;//для первой прямой точка на расстоянии Д
        deltaY1 = deltaX1 * k1 + b1;
        deltaX2 = xCross + Math.cos(Math.atan(k2)) * d;//для второй прямой точка на расстоянии Д
        deltaY2 = deltaX2 * k2 + b2;
        midX0 = (deltaX1 + deltaX2) / 2;
        midY0 = (deltaY1 + deltaY2) / 2;
        k3 = (yCross - midY0) / (xCross - midX0);
        b3 = yCross - xCross * k3;
        if(yCross > (xCross + Math.cos(Math.atan(k3)) * d - 1) * k3 + b3){//биссектриса возрастает
            midX0 = xCross + 5 * Math.cos(Math.atan(k3)) + Math.cos(Math.atan(k3)) * d;
            angleForSize = Math.atan(k3) * 180 / Math.PI + 90;//угол наклона подписи
        }
        else{//биссектриса убывает
            midX0 = xCross - 13 * Math.cos(Math.atan(k3))  + Math.cos(Math.atan(k3)) * d;
            angleForSize = Math.atan(k3) * 180 / Math.PI - 90;//угол наклона подписи
        }
        midY0 = k3 * midX0 + b3;

    }
    else if ((pagey < k2 * pagex + b2) && (pagey < k1 * pagex + b1) ){//II part
        console.log('second');
        currentPart = true;//true когда II и IV четверть иначе I и III,чтобы линия стрелка отображалась корректно в 2 и 4 областях
        deltaX1 = xCross + Math.cos(Math.atan(k1)) * d;//для первой прямой точка на расстоянии Д
        deltaY1 = deltaX1 * k1 + b1;
        deltaX2 = xCross - Math.cos(Math.atan(k2)) * d;//для второй прямой точка на расстоянии Д
        deltaY2 = deltaX2 * k2 + b2;
        midX0 = (deltaX1 + deltaX2) / 2;
        midY0 = (deltaY1 + deltaY2) / 2;
        k3 = (yCross - midY0) / (xCross - midX0);
        b3 = yCross - xCross * k3;
        if (k3 < 0){//биссектриса возрастает
            midX0 = xCross + 5 * Math.cos(Math.atan(k3)) + Math.cos(Math.atan(k3)) * d;
            angleForSize = Math.atan(k3) * 180 / Math.PI + 90;
        }
        else{//биссектриса убывает
            midX0 = xCross - 7 * Math.cos(Math.atan(k3)) - Math.cos(Math.atan(k3)) * d;
            angleForSize = Math.atan(k3) * 180 / Math.PI - 90;
        }

        midY0 = k3 * midX0 + b3;//вычисление координаты y после преобразования х

    }
    else if((pagey >= k2 * pagex + b2) && (pagey <= k1 * pagex + b1) ){//III part
        console.log('third')
        currentPart = false;//true когда II и IV четверть иначе I и III,чтобы линия стрелка отображалась корректно в 2 и 4 областях
        deltaX1 = xCross - Math.cos(Math.atan(k1)) * d;//для первой прямой точка на расстоянии Д
        deltaY1 = deltaX1 * k1 + b1;
        deltaX2 = xCross - Math.cos(Math.atan(k2)) * d;//для второй прямой точка на расстоянии Д
        deltaY2 = deltaX2 * k2 + b2;
        midX0 = (deltaX1 + deltaX2) / 2;
        midY0 = (deltaY1 + deltaY2) / 2;
        k3 = (yCross - midY0) / (xCross - midX0);
        b3 = yCross - xCross * k3;
        if(yCross > (xCross - Math.cos(Math.atan(k3)) * d - 1) * k3 + b3){//биссектриса убывает
            midX0 = xCross - 13 * Math.cos(Math.atan(k3)) -  Math.cos(Math.atan(k3)) * d;
            angleForSize = Math.atan(k3) * 180 / Math.PI - 90;//угол наклона подписи
        }
        else{//возрастающая биссектриса
            midX0 = xCross + 4 * Math.cos(Math.atan(k3)) - Math.cos(Math.atan(k3)) * d;
            angleForSize = Math.atan(k3) * 180 / Math.PI + 90;//угол наклона подписи
        }
        midY0 = k3 * midX0 + b3;
    }
    else if((pagey > k2 * pagex + b2) && (pagey > k1 * pagex + b1) ){//IV part
        console.log('fourth');
        currentPart = true;//true когда II и IV четверть иначе I и III,чтобы линия стрелка отображалась корректно в 2 и 4 областях
        deltaX1 = xCross - Math.cos(Math.atan(k1)) * d;//для первой прямой точка на расстоянии Д
        deltaY1 = deltaX1 * k1 + b1;
        deltaX2 = xCross + Math.cos(Math.atan(k2)) * d;//для второй прямой точка на расстоянии Д
        deltaY2 = deltaX2 * k2 + b2;
        midX0 = (deltaX1 + deltaX2) / 2;
        midY0 = (deltaY1 + deltaY2) / 2;
        k3 = (yCross - midY0) / (xCross - midX0);
        b3 = yCross - xCross * k3;
        if (k3 < 0){//биссектриса возрастает
            midX0 = xCross + 4 * Math.cos(Math.atan(k3))  - Math.cos(Math.atan(k3)) * d;
            angleForSize = Math.atan(k3) * 180 / Math.PI + 90;
        }
        else {//биссектриса убывает
            midX0 = xCross - 7 * Math.cos(Math.atan(k3)) + Math.cos(Math.atan(k3)) * d;
            angleForSize = Math.atan(k3) * 180 / Math.PI - 90;
        }

        midY0 = k3 * midX0 + b3;

    }
    if (deltaX1 - xCross > 0){//реализуем выход размерных прямых, если точка дуги конечная больше по Х чем точка пересечения
        xFirstNormal = deltaX1 + 15 * Math.cos(Math.atan(k1));//размерные линии между которыми стрелка
    }
    else{
        xFirstNormal = deltaX1 - 15 * Math.cos(Math.atan(k1));
    }
    if (deltaX2 - xCross > 0){
        xSecondNormal = deltaX2 + 15 * Math.cos(Math.atan(k2));
    }
    else{
        xSecondNormal = deltaX2 - 15 * Math.cos(Math.atan(k2));
    }
    if(currentPart){//для 2 и 4 области чтобы они отбражались не инверитравано(размерная стрелка)
        var xStock = deltaX1;
        var yStock = deltaY1;
        deltaX1 = deltaX2;
        deltaY1 = deltaY2;
        deltaX2 = xStock;
        deltaY2 = yStock;

    }
    yFirstNormal = k1 * xFirstNormal + b1;
    ySecondNormal = k2 * xSecondNormal + b2;//пересчет, тк изменились значения

    if (start == 1){//заходим,когда передвигаем размер
        size[numberOfSize].text.remove();
        size[numberOfSize].visibleFNormal.plot(xCross, yCross, xSecondNormal, ySecondNormal);
        size[numberOfSize].visibleSNormal.plot(xCross, yCross, xFirstNormal, yFirstNormal);
        size[numberOfSize].lineVisible.plot('M' + deltaX2 + ' ' + deltaY2 + ' ' +  'A' + d + ' ' + d + ' ' + '0 0 0' + ' ' + deltaX1 + ' ' + deltaY1);
        size[numberOfSize].firstNormal.plot(xCross, yCross, xSecondNormal, ySecondNormal);
        size[numberOfSize].secondNormal.plot(xCross, yCross, xFirstNormal, yFirstNormal);
        size[numberOfSize].line.plot('M' + deltaX2 + ' ' + deltaY2 + ' ' +  'A' + d + ' ' + d + ' ' + '0 0 0' + ' ' + deltaX1 + ' ' + deltaY1);

        size[numberOfSize].text = drawing.text(function (add) {
            midX0 = midX0;
            midY0 = midY0;
            add.tspan(name1).fill('black').dx(midX0).dy(midY0);
        }).rotate(angleForSize);
        console.log("k3 = " + Math.atan(k3) * 180 / Math.PI);
        console.log(Math.cos(Math.atan(k2)));
        console.log(Math.cos(Math.atan(k1)));
    }

    if (start == 0){//заходим,когда создаем размер
        a1 = drawing.path('M10 30 A 20 10 0 0 0 30 30').stroke({color:'blue', width:1}).fill('none');
        a = drawing.path('M10 30 A 20 10 0 0 0 30 30').stroke({color:'transparent', width:10}).fill('none');
        a1.marker('start', 20, 20, function (add) {//рисуем стрелки начала
            add.polyline('0,10 20,5 10,10 20,15 0,10').fill('blue');
            add.ref(0, 10);
        }).marker('end', 30, 30, function (add) {//рисуем стрелки конца
            add.polyline('20,10 0,5 10,10 0,15 20,10').fill('blue');
            add.ref(20, 10);
        });
        text = drawing.text(function (add) {
            add.tspan(name).fill('black').dx(-10).dy(-10);
        });

        vert1Visible = drawing.line(0, 0, 0, 0).stroke({color:'blue', width: 1});//Прямая с коэффициентом k1
        vert2Visible = drawing.line(0, 0, 0, 0).stroke({color:'blue', width: 1});//Прямая с коэффициентом k1
        vert1 = drawing.line(0, 0, 0, 0).stroke({color:'transparent', width: 10});//Прямая с коэффициентом k1
        vert2 = drawing.line(0, 0, 0, 0).stroke({color:'transparent', width: 10});//Прямая с коэффициентом k2
        addTheSize(name1, a, vert1, vert2, text, a1, vert1Visible, vert2Visible);
        start = 1;

    }


}//Угловой размер.

var drawMmove = function (e) {
    console.log("drawMmove")
    //по типу линии определяем какой размер рисовать
    if (typeline == 'horizontalSize') {
        drawNormalSize(e);
    }//Если выбранный размер - горизонтальный или вертикальный.
    if (typeline == 'angularSize') {
        drawAngularSize(e);
    }//Если выбранный размер наклонён под каким-либо углом.
    if (typeline == 'angleSize'){//прописать для вертикали есловие
        drawAngleSize(e);
    }//Угловой размер.
}//Функция рисования размеров.

var drawClickSize = function (e) {
    console.log("drawClickSize");
    drawingAdress.off('mousemove', drawMmove);//Отключает перерисовку при движении курсором.
    drawingAdress.off('click', drawClickSize);//Заканчивает рисование размера и фиксирует размерные линии.
    start = 0;
    jObject = -1;//Обнуляем значение последнего выбранного объекта. Теперь никакой объект не выбран.
    jObject2 = -1;//Обнуляем значение предпоследнего выбранного объекта.
    touchSize(numberOfSize);
    numberOfSize++;//Переходим на следующий элемент массива для записи туда нового размера.
    first_point = {};

}//Отвечает за установку окончательного местоположения размера.

function touchObject(j) {
    console.log("PosX = " + posX + "PosY = " + posY + "FPx = " + first_point.x + "FPy = " + first_point.y);
    console.log("touchObject");
    //for (var j = 0; object[j]; j++) {
    object[j].type.click(function () {
        event.stopPropagation();
        for (var i = 0; object[i]; i++)//Определяем объект в массиве, на который был совершён клик.
            if (this == object[i].type) {
                k = i;//Сохраняем индекс объекта в массиве.
                if(firstUse==0)
                {
                    jObject1=k;
                    firstUse=1;
                }
                if(forDrawInMenu){
                    //jObject2 = jObject;//Хранит предпоследний выбранный объект.
                    //jObject = k;//Хранит последний выбранный объект.
                    settings(k);//выводит параметры данного объекта на экран в формы
                    return;
                }
                break;//находим нужный элемент и выходим из цикла
            }
        jObject2 = jObject;//Хранит предпоследний выбранный объект.
        jObject = k;//Хранит последний выбранный объект.
        if(typeline=='normal' && (object[jObject].objectType!='visibleDot' && object[jObject].objectType!="unvisibleDot")) {//Возможность выбрать точку для рисования перпендикуляра
            jObject2=jObject;
        }
        if(typeline =='delete') {//Если пользователь хочет удалить какой-либо объект
            typeDelete = "object";//тип удаляемого объекта
            drawAll();
            return;//Останавливаем выполнение подпрограммы.
        }
        if (typeline != 'angleSize')//Если мы хотим нарисовать что-то кроме углового размера.
            chooseDotBig(k);//передаем в функцию для подсвечивания точек привязок, к - индекс объекта в массиве.
        else if (jObject2 != -1)//Если мы хотим нарисовать угловой размер.
            drawAll();
    })
    object[j].text.mousedown(function () {
        event.stopPropagation();
        for (var i = 0; object[i]; i++)//Определяем объект в массиве, на который был совершён клик.
            if (this == object[i].text) {
                k = i;//Сохраняем индекс объекта в массиве.
                drawingAdress.on('mousemove', function actionObj(e){
                    drawingAdress.on('mouseup', function closeActionObj(e) {
                        drawingAdress.off('mousemove', actionObj);
                        drawingAdress.off('mouseup', closeActionObj);
                        touchObject(k);
                    });
                    xx = e.pageX - drawingAdress.offset().left;
                    yy = e.pageY - drawingAdress.offset().top;
                    object[k].text.remove();
                    object[k].text = drawing.text(function (add) {
                        add.tspan(object[j].name).fill(object[j].colorObj).dx(xx).dy(yy);})
                });
            }
        //jObject2 = jObject;//Хранит предпоследний выбранный объект.
        //jObject = k;//Хранит последний выбранный объект.
        if(typeline =='delete') {//Если пользователь хочет удалить какой-либо объект
            typeDelete = "object";//тип удаляемого объекта
            drawAll();
            return;//Останавливаем выполнение подпрограммы.
        }
    })

    //}
}//Запускается каждый раз при создании объекта и вешает на каждый объект обработчик клика object[j].type.click

function touchSize(j){
    console.log("touchSize");
    size[j].line.click(function () {//клик на двухстороннюю линию
        event.stopPropagation();
        for (var i = 0; size[i]; i++)//Определяем объект в массиве, на который был совершён клик.
            if (this == size[i].line) {
                k = i;//Сохраняем индекс объекта в массиве.
            }
        jSize2 = jSize;//Хранит предпоследний выбранный размер.
        jSize = k;//Хранит последний выбранный размер.
        if(typeline =='delete') {//Если пользователь хочет удалить какой-либо размер
            typeDelete = "size";//тип удаляемого размера
            drawAll();
            return;//Останавливаем выполнение подпрограммы.
        }
    })
    size[j].firstNormal.click(function () {//клик по впомогательной прямой размера
        event.stopPropagation();
        for (var i = 0; size[i]; i++)//Определяем объект в массиве, на который был совершён клик.
            if (this == size[i].firstNormal) {
                k = i;//Сохраняем индекс объекта в массиве.
            }
        jSize2 = jSize;//Хранит предпоследний выбранный объект.
        jSize = k;//Хранит последний выбранный объект.
        if(typeline =='delete') {//Если пользователь хочет удалить какой-либо размер
            typeDelete = "size";//тип удаляемого размера
            drawAll();
            return;//Останавливаем выполнение подпрограммы.
        }
    })
    size[j].secondNormal.click(function () {//клик по впомогательной прямой размера
        event.stopPropagation();
        for (var i = 0; size[i]; i++)//Определяем объект в массиве, на который был совершён клик.
            if (this == size[i].secondNormal) {
                k = i;//Сохраняем индекс объекта в массиве.
            }
        if(typeline =='delete') {//Если пользователь хочет удалить какой-либо размер
            typeDelete = "size";//тип удаляемого размера
            drawAll();
            return;//Останавливаем выполнение подпрограммы.
        }
    })
    size[j].text.mousedown(function () {//при нажатии на размер - можно его переносить
        event.stopPropagation();
        for (var i = 0; size[i]; i++)//Определяем объект в массиве, на который был совершён клик.
            if (this == size[i].text) {
                k = i;//Сохраняем индекс объекта в массиве.
                drawingAdress.on('mousemove', function actionSize(e){//запускаем событие движение по полю
                    drawingAdress.on('mouseup', function closeActionSize(e) {//запускаем событие при отпускании мыши
                        drawingAdress.off('mousemove', actionSize);//отменяем события
                        drawingAdress.off('mouseup', closeActionSize);
                        touchSize(k);//опять накидываем события на прямые, так как mousedown разовое
                    });
                    xx = e.pageX - drawingAdress.offset().left;
                    yy = e.pageY - drawingAdress.offset().top;
                    size[k].text.remove();//удаляем подпись
                    size[k].text = drawing.text(function (add) {//создаем подпись
                        add.tspan(size[j].value).fill('black').dx(xx).dy(yy);})
                });
            }
        jSize2 = jSize;//Хранит предпоследний выбранный объект.
        jSize = k;//Хранит последний выбранный объект.
        if(typeline =='delete') {//Если пользователь хочет удалить какой-либо размер
            typeDelete = "size";//тип удаляемого размера
            drawAll();
            return;//Останавливаем выполнение подпрограммы.
        }
    })
}

function chooseDotBig(j) {//Передали номер в массиве object
    console.log("заход в chooseto big для подсвечивания точек для привязки chooseDotBig")
    var x5;
    var y5;
    r = 15;//чтобы много раз не считать радиус
    if (object[jObject].objectType == 'circle' || object[jObject].objectType == 'circleR') {//Пересечение прямой с окружностью.
        console.log('тип окружность');
        for (var i = 0; object[i]; i++) {
            if (object[i].objectType != 'circle' && object[i].objectType != 'circleR') {//если элемент в массиве не окружность!!!!рассмотреть еще ELSE для пересечения с окружностью
                var b1;
                var b;
                var k;
                var x0;
                var y0;
                var ax;
                var ay;
                var bx;
                var by;
                if(object[i].y1 == object[i].y2){
                    k = 0;
                    b = object[i].y1;
                    b1 = object[jObject].x1
                    x0=object[jObject].x1;
                    y0= object[i].y1;
                }
                else if(object[i].x1 == object[i].x2){
                    k = 1;
                    b = object[i].x1;
                    b1 = object[jObject].y1;
                    x0=object[i].x1;
                    y0=object[jObject].y1;
                }
                else {
                    k = object[i].A / object[i].B;
                    b = -object[i].x1 * k + object[i].y1;
                    b1 = object[jObject].y1 + object[jObject].x1 / k;
                    x0 = (b1 - b) / (k + 1 / k);  //(-object[i].A * object[i].C) / (object[i].A * object[i].A + object[i].B * object[i].B);//находим ближайщую точку прямой к центру окружности
                    y0 = -x0/k + b1;//(-object[i].B * object[i].C) / (object[i].A * object[i].A + object[i].B * object[i].B);
                }
                console.log('ближайшая точка '+ x0 +' ' + y0 );
                var d = Math.sqrt((object[jObject].x1 - x0) * (object[jObject].x1 - x0) + (object[jObject].y1 - y0) * (object[jObject].y1 - y0));
                console.log('d= ' + d + 'R= ' + object[jObject].R);//кратчайщее расстояние до прямой от центра окружности
                if (d > object[jObject].R){//если прямая не пересекает окружность
                    console.log('расстояние больше радиуса');

                }
                else if(d == object[jObject].R){
                    dot0 = drawing.circle(r).x(x0 - r / 2).y(y0 - r / 2).fill('transparent').stroke({//Подсвечиваем точки
                        width: 1,
                        color: 'black',
                        opacity: 1
                    });
                    dots.push({
                        type: dot0,
                        x1: x0,
                        y1: y0
                    })
                }
                else if (d < object[jObject].R){
                    var diskr = (- 2 * object[jObject].x1 + 2 * k * b - 2 * k * object[jObject].y1) * (- 2 * object[jObject].x1 + 2 * k * b - 2 * k * object[jObject].y1)
                        - 4 * (1 + k * k) * (object[jObject].y1 * object[jObject].y1 + object[jObject].x1 * object[jObject].x1 - object[jObject].R * object[jObject].R - 2 * b * object[jObject].y1 + b * b);//дискриминант
                    console.log('diskr= '+ diskr);
                    if(object[i].x1 == object[i].x2)
                    {
                        var diskr= (-2*object[jObject].y1) * (-2*object[jObject].y1)-4*(object[jObject].x1*object[jObject].x1-2*object[jObject].x1*object[i].x1+object[i].x1*object[i].x1 + object[jObject].y1*object[jObject].y1-object[jObject].R*object[jObject].R);
                        console.log(k);
                        ax = object[i].x1;
                        ay = (2*object[jObject].y1+Math.sqrt(diskr))/2;
                        bx = object[i].x1;
                        by = (2*object[jObject].y1-Math.sqrt(diskr))/2;
                    }
                    else {
                        ax = (-(-2 * object[jObject].x1 + 2 * k * b - 2 * k * object[jObject].y1) + Math.sqrt(diskr)) / (2 + 2 * k * k);
                        ay = k * ax + b;
                        bx = (-(-2 * object[jObject].x1 + 2 * k * b - 2 * k * object[jObject].y1) - Math.sqrt(diskr)) / (2 + 2 * k * k);
                        by = k * bx + b;
                    }
                    console.log('ax = ' + ax + 'ay = ' + ay);
                    console.log('bx = ' + bx + 'by = ' + by);
                    if ((ax <= object[i].x2 && ax >= object[i].x1) || (ax >= object[i].x2 && ax <= object[i].x1)) {
                        dot0 = drawing.circle(r).x(ax - r / 2).y(ay - r / 2).fill('transparent').stroke({//Подсвечиваем точки
                            width: 1,
                            color: 'black',
                            opacity: 1
                        });
                        dots.push({
                            type: dot0,
                            x1: ax,
                            y1: ay
                        })
                    }
                    if ((bx <= object[i].x2 && bx >= object[i].x1) || (bx >= object[i].x2 && bx <= object[i].x1)) {
                        dot6 = drawing.circle(r).x(bx - r / 2).y(by - r / 2).fill('transparent').stroke({//Подсвечиваем точки
                            width: 1,
                            color: 'black',
                            opacity: 1
                        });
                        dots.push({
                            type: dot6,
                            x1: bx,
                            y1: by
                        })
                    }
                }
            }

        }

    }
    else{
        var k1 = object[jObject].A / object[jObject].B;//считаем к выбранного объкта
        if(object[jObject].x1==object[jObject].x2) {//Если фигня вертикальная
            k1=1;
        }
        if(object[jObject].y1==object[jObject].y2){//Если фигня горизонтальная
            k1=0;
        }
        for (var i = 0; object[i]; i++) {
            if (object[i].objectType != 'circle' || object[i].objectType != 'circleR') {//если элемент в массиве не окружность
                var k2 = object[i].A / object[i].B;
                if(object[i].x1==object[i].x2 && object[jObject].y1==object[jObject].y2){//Если пррямая из массива вертикальная
                    console.log("выбрали горизонтальную!");
                    k2=1;
                    x5=object[i].x1;
                    y5=object[jObject].y1;
                }
                else if(object[i].y1==object[i].y2 && object[jObject].x1==object[jObject].x2){//Если прямая из массива горизонтальная
                    k2=0;
                    x5=object[jObject].x1;
                    y5=object[i].y1;
                }
                else {
                    x5 = ((object[i].y1 - object[i].x1 * k2) - (object[jObject].y1 - object[jObject].x1 * k1)) / (k1 - k2);//находим х точки пересечения прямых
                    y5 = k1 * x5 + (object[jObject].y1 - object[jObject].x1 * k1);                                         //находим у точки пересечения прямых
                }
                console.log(x5 + ' ' + y5 );
                if (i != jObject) {
                    if ((x5 <= object[jObject].x2 && x5 >= object[jObject].x1) || (x5 >= object[jObject].x2 && x5 <= object[jObject].x1))
                        if ((x5 <= object[i].x2 && x5 >= object[i].x1) || (x5 >= object[i].x2 && x5 <= object[i].x1)) {
                            dot0 = drawing.circle(r).x(x5 - r / 2).y(y5 - r / 2).fill('transparent').stroke({//Подсвечиваем точки
                                width: 1,
                                color: 'black',
                                opacity: 1
                            });
                            dots.push({
                                type: dot0,
                                x1: x5,
                                y1: y5
                            })
                        }
                }
            }

        }

    }
    if(object[jObject].objectType!='horizontalLine'&&object[jObject].objectType!='verticalLine'&&object[jObject].objectType!='simpleline') {
        dot1 = drawing.circle(r).x(object[j].x1 - r / 2).y(object[j].y1 - r / 2).fill('transparent').stroke({//Подсвечиваем точки
            width: 1,
            color: 'black',
            opacity: 1
        });


        dot2 = drawing.circle(r).x(object[j].x2 - r / 2).y(object[j].y2 - r / 2).fill('transparent').stroke({
            width: 1,
            color: 'black',
            opacity: 1
        });

        dot3 = drawing.circle(r).x(object[j].midX - r / 2).y(object[j].midY - r / 2).fill('transparent').stroke({
            width: 1,
            color: 'black',
            opacity: 1
        });

        dot4 = drawing.circle(r).x(object[j].x3 - r / 2).y(object[j].y3 - r / 2).fill('transparent').stroke({
            width: 1,
            color: 'black',
            opacity: 1
        });

        dot5 = drawing.circle(r).x(object[j].x4 - r / 2).y(object[j].y4 - r / 2).fill('transparent').stroke({
            width: 1,
            color: 'black',
            opacity: 1
        });
        ////var xx;
        ////var yy;
        ////var distance = (Math.sqrt((Math.pow(object[jObject].x1 - posX, 2)) - (Math.pow(object[jObject].y1 - posY, 2))));//расстояние от точки до центра последнего объекта
        ////if ((object[jObject].type ="circle") && distance > object[jObject].R) {//Касательная к окружности
        ////
        ////    var sina = object[jObject].R / distance;
        ////    var point1 = new SVG.math.Point(posX + 20,posY);
        ////    var point2 = new SVG.math.Point(posX, posY);
        ////    var point3 = new SVG.math.Point(object[jObject].x1, object[jObject].y1);
        ////    var anglehelp = SVG.math.angle(point1, point2, point3);//угол между прямой от точки до центра окружности и прямой // оси ОХ
        ////    console.log(anglehelp);
        ////
        ////    var AC = sina * object[jObject].R;//рисунок 1
        ////    var dx = Math.cos(anglehelp) * AC;
        ////    var dy = Math.sin(anglehelp) * AC;
        ////    var Ax = dx + object[jObject].x1;// координаты точки А рисунок 1
        ////    var Ay = dy + object[jObject].y1;
        ////    var Ahelp=posX-object[jObject].x1;
        ////    var Bhelp=posY-object[jObject].y1;
        ////    var Chelp=-Ahelp*posX-Bhelp*posY;
        ////    var knorm=-Bhelp/Ahelp;
        ////    var bnorm=Ay-knorm*Ax;
        ////
        ////
        ////    var diskr = (- 2 * object[jObject].x1 + 2 * knorm * bnorm - 2 * knorm * object[jObject].y1) * (- 2 * object[jObject].x1 + 2 * knorm * bnorm - 2 * knorm * object[jObject].y1)
        ////        - 4 * (1 + knorm * knorm) * (object[jObject].y1 * object[jObject].y1 + object[jObject].x1 * object[jObject].x1 - object[jObject].R * object[jObject].R - 2 * bnorm * object[jObject].y1 + bnorm * bnorm);//дискриминант
        ////    console.log('diskr= '+ diskr);
        ////
        ////    if(object[jObject].x1 == posX)
        ////    {
        ////        var diskr= (-2*object[jObject].y1) * (-2*object[jObject].y1)-4*(object[jObject].x1*object[jObject].x1-2*object[jObject].x1*object[i].x1+object[i].x1*object[i].x1 + object[jObject].y1*object[jObject].y1-object[jObject].R*object[jObject].R);
        ////        console.log(knorm);
        ////        ax = object[j].x1;
        ////        ay = (2*object[jObject].y1+Math.sqrt(diskr))/2;
        ////        bx = object[i].x1;
        ////        by = (2*object[jObject].y1-Math.sqrt(diskr))/2;
        ////    }
        ////    else {
        ////        ax = (-(-2 * object[jObject].x1 + 2 * knorm * bnorm - 2 * knorm * object[jObject].y1) + Math.sqrt(diskr)) / (2 + 2 * knorm * knorm);
        ////        ay = knorm * ax + bnorm;
        ////        bx = (-(-2 * object[jObject].x1 + 2 * knorm * bnorm - 2 * knorm * object[jObject].y1) - Math.sqrt(diskr)) / (2 + 2 * knorm * knorm);
        ////        by = knorm * bx + bnorm;
        ////    }
        ////    console.log('ax = ' + ax + 'ay = ' + ay);
        ////    console.log('bx = ' + bx + 'by = ' + by);
        //
        //    dot0 = drawing.circle(r).x(ax - r / 2).y(ay - r / 2).fill('transparent').stroke({//Подсвечиваем точки
        //        width: 1,
        //        color: 'black',
        //        opacity: 1
        //    });
        //    dots.push({
        //        type: dot0,
        //        x1: ax,
        //        y1: ay
        //    })
        //
        //    dot0 = drawing.circle(r).x(bx - r / 2).y(by - r / 2).fill('transparent').stroke({//Подсвечиваем точки
        //        width: 1,
        //        color: 'black',
        //        opacity: 1
        //    });
        //    dots.push({
        //        type: dot0,
        //        x1: bx,
        //        y1: by
        //    })
        //
        //
        //
        //
        //    xx = ((posX - object[j].midX) * (posX - object[j].midX) + (posY - object[j].midY) * (posY - object[j].midY) - object[j].r * object[j].r) *
        //        ((posX - object[j].midX) * (posX - object[j].midX) + (posY - object[j].midY) * (posY - object[j].midY) - object[j].r * object[j].r) /
        //        ((posX - object[j].midX) * (posX - object[j].midX) + (posY - object[j].midY) * (posY - object[j].midY));
        //
        //    yy = Math.sqrt(((posX - object[j].midX) * (posX - object[j].midX) + (posY - object[j].midY) * (posY - object[j].midY) - object[j].r * object[j].r) *
        //        ((posX - object[j].midX) * (posX - object[j].midX) + (posY - object[j].midY) * (posY - object[j].midY) - object[j].r * object[j].r) -
        //        ((posX - object[j].midX) * (posX - object[j].midX) + (posY - object[j].midY) * (posY - object[j].midY) - object[j].r * object[j].r) *
        //        ((posX - object[j].midX) * (posX - object[j].midX) + (posY - object[j].midY) * (posY - object[j].midY) - object[j].r * object[j].r) /
        //        ((posX - object[j].midX) * (posX - object[j].midX) + (posY - object[j].midY) * (posY - object[j].midY)) *
        //        ((posX - object[j].midX) * (posX - object[j].midX) + (posY - object[j].midY) * (posY - object[j].midY) - object[j].r * object[j].r) *
        //        ((posX - object[j].midX) * (posX - object[j].midX) + (posY - object[j].midY) * (posY - object[j].midY) - object[j].r * object[j].r) /
        //        ((posX - object[j].midX) * (posX - object[j].midX) + (posY - object[j].midY) * (posY - object[j].midY)))
        //    object[j].tangentX = posX + xx;
        //    object[j].tangentY = posY + yy;
        //}

        /*dot6 = drawing.circle(r).x(object[j].tangentX - r / 2).y(object[j].tangentY - r / 2).fill('transparent').stroke({
         width: 1,
         color: 'black',
         opacity: 1
         });//ЛОГИКААААААА*/

        dots.push({
            type: dot1,
            x1: object[j].x1,
            y1: object[j].y1
        })
        dots.push({
            type: dot2,
            x1: object[j].x2,
            y1: object[j].y2
        })
        dots.push({
            type: dot3,
            x1: object[j].midX,
            y1: object[j].midY
        })

        dots.push({
            type: dot4,
            x1: object[j].x3,
            y1: object[j].y3
        })

        dots.push({
            type: dot5,
            x1: object[j].x4,
            y1: object[j].y4
        })
    }

    /* dots.push({
     type: dot6,
     x1: object[j].tangentX,
     y1: object[j].tangentY
     })*/
    console.log("dots должны появиться")
    for (var j = 0; dots[j]; j++) {// удаляем точки подсветки привязок
        dots[j].type.click(function () {
            console.log("Выбрали объект1");
            event.stopPropagation();
            for (var i = 0; dots[i]; i++)//Кликаем на нужный объект
                if (this == dots[i].type) {
                    k = i;
                }
            for (var q = 0; dots[q]; q++) {//удаляем объекты подсветки
                dots[q].type.remove();
            }
            console.log("Выбрали объект2");
            connectToDot(dots[k].x1, dots[k].y1);//передем точку для рисования
            dots = [];
        })
    }
}

function connectToDot(x1, y1) {//обрабавтываеся первое и второе нажатие мыши
    console.log("connectToDot");
    if (!first_point.x && !first_point.y) {//заходим сюда, когда первой точки нет
        console.log('Определяется 1 точка')
        first_point.x = x1;
        first_point.y = y1;
        console.log(first_point.x)
        console.log(first_point.y)
        snapEnd = true;//Помечаем окончание режима привязки.
        if (typeline == 'horizontalLine' || typeline == 'verticalLine' || typeline == 'normal' || typeline == 'angle' || typeline == 'parallel' || typeline == 'visibleDot' || typeline == 'unvisibleDot' || typeline == 'circleR') {
            console.log("Рисуем")//Рисуем элементы, которым достаточно 1 точки.
            drawAll();
        }
        else if (typeline == "line" || typeline == "circle"){//для этих объектов резинка
            drawingAdress.on('mousemove', elastic);//включаем резинку
        }//резинка
    }
    else {//заходим сюда, когда точка первая есть
        console.log('Определяется 2 точка')
        posX = x1;//first_point.x;
        posY = y1;//first_point.y;
        console.log(first_point.x);
        console.log(first_point.y);
        console.log(posX);
        console.log(posY);
        drawAll();//Рисуем элементы которым необходимао 2 точки.
        snapEnd = true;
    }
}//Записывает значения Х и Y выбранной точки привязки в переменные первой или второй точки рисования в зависимости от необходимости.

function deleteObject(){
    object[jObject].visibleObject.remove();
    object[jObject].type.remove();
    object[jObject].text.remove();
    object.splice(jObject, 1);
    numberOfObjects--;//Уменьшаем номер последнего элемента массива объектов
    typeDelete = "";
    console.log('удалил объект');
}

function drawAll() {
    console.log("drawAll")
    var xx;
    var yy;//вспомогательные переменные
    var A;
    var B;
    var C;//коэффициенты прямой
    var c;//Видимый объект.
    var a;//Невидимый объект для обработки клика.
    if(typeline=='linear') {
        var road=Math.sqrt((first_point.x-posX)*(first_point.x-posX) + (first_point.y-posY)*(first_point.y-posY));
        document.getElementById('linear').innerHTML = "Расстояние: " + road;
        first_point={};
    }
    else if(typeline=='delete') {
        if(typeDelete == "object") {
            deleteObject();
        }
        else if (typeDelete == "size"){

            size[jSize].visibleFNormal.remove();
            size[jSize].visibleSNormal.remove();
            size[jSize].firstNormal.remove();
            size[jSize].secondNormal.remove();
            size[jSize].text.remove();
            size[jSize].line.remove();
            size[jSize].lineVisible.remove();
            size.splice(jSize, 1);
            typeDelete = "";
            numberOfSize--;
            console.log("удалил размер");
        }

        first_point = {};
        start = 0;
    }
    else if(typeline=='splittingLine'){
        //console.log(object[jObject].objectType);
        if(object[jObject].objectType=="line") {
            console.log(jObject);
            c = drawing.line(first_point.x, first_point.y, object[jObject].x1, object[jObject].y1).stroke({
                width: 1,
                color: color,
            });
            a = drawing.line(first_point.x, first_point.y, object[jObject].x1, object[jObject].y1).stroke({
                width: 10,
                color: 'transparent',
            });
            A = transformFromMachineToUser(object[jObject].y1) - transformFromMachineToUser(first_point.y);
            B = -(object[jObject].x1 - first_point.x);
            C = -A * first_point.x - B * transformFromMachineToUser(first_point.y);
            addTheElement("line", name, a, first_point.x, first_point.y, object[jObject].x1, object[jObject].y1,
                -10, -10, -10, -10, (first_point.x + object[jObject].x1) / 2, (first_point.y + object[jObject].y1) / 2, -1, A, B, C, c, text1);
            touchObject(numberOfObjects);
            numberOfObjects++;
            c = drawing.line(object[jObject].x2, object[jObject].y2, first_point.x, first_point.y).stroke({
                width: 1,
                color: color,
            });
            a = drawing.line(object[jObject].x2, object[jObject].y2, first_point.x, first_point.y).stroke({
                width: 10,
                color: 'transparent',
            });
            addTheElement("line", name, a, object[jObject].x2, object[jObject].y2, first_point.x, first_point.y,
                -10, -10, -10, -10, (object[jObject].x2 + first_point.x) / 2, (object[jObject].y2 + first_point.y) / 2, -1, A, B, C, c, text1);
            touchObject(numberOfObjects);
            numberOfObjects++;
            first_point={};
            deleteObject();
            jObject=-1;
            jObject2=-1
        }
    }
    else if(typeline=='splittingCircle'){
        //Работает, если прямая разделения выше центра.
        //Если центр окружности ниже центра прямой сечения, то меньшая дуга. Если выше, то большая.
        var yCenterSec;//Координаты центра секущей
        var firstVar, secondVar;//Первый вариант - центр секущей выше центра окрудности, второй - наоборот
        yCenterSec=(first_point.y+posY)/2;
        if(posX<first_point.x)
        {
            var tempX, tempY;
            tempX=posX;
            posX=first_point.x;
            first_point.x=tempX;
            tempY=posY;
            posY=first_point.y;
            first_point.y=tempY;
        }
        console.log(first_point.x, posX);
        if(yCenterSec < object[jObject].y1)
        {
            firstVar = '0 0,1';
            secondVar='0 1,0';
        }
        else
        {
            firstVar='0 1,1';
            secondVar='0 0,0';
        }
        console.log(firstVar);
        c = drawing.path("M "+first_point.x+"," + first_point.y + " "+"A"+object[jObject].R+","+object[jObject].R+ " " +firstVar+" "+posX+","+posY).stroke({
            width: 1,
            color: color,
        }).fill('none');
        a = drawing.path("M "+first_point.x+"," + first_point.y + " "+"A"+object[jObject].R+","+object[jObject].R+" "+firstVar+" "+posX+","+posY).stroke({
            width: 10,
            color: 'transparent',
        }).fill('none');
        addTheElement("arc", name, a, object[jObject].x2, object[jObject].y2, first_point.x, first_point.y,
            -10, -10, -10, -10, (object[jObject].x2 + first_point.x) / 2, (object[jObject].y2 + first_point.y) / 2, -1, 0, 0, 0, c, text1);
        touchObject(numberOfObjects);
        numberOfObjects++;
        //console.log("Круг разорван");
        c = drawing.path("M "+first_point.x+"," + first_point.y + " "+"A"+object[jObject].R+","+object[jObject].R+ " " +secondVar+" "+posX+","+posY).stroke({
            width: 1,
            color: color,
        }).fill('none');
        a = drawing.path("M "+first_point.x+"," + first_point.y + " "+"A"+object[jObject].R+","+object[jObject].R+" "+secondVar+" "+posX+","+posY).stroke({
            width: 10,
            color: 'transparent',
        }).fill('none');
        addTheElement("arc", name, a, object[jObject].x2, object[jObject].y2, first_point.x, first_point.y,
            -10, -10, -10, -10, (object[jObject].x2 + first_point.x) / 2, (object[jObject].y2 + first_point.y) / 2, -1, 0, 0, 0, c, text1);
        touchObject(numberOfObjects);
        numberOfObjects++;
        deleteObject();
        first_point={};
        posX=0; posY=0;
    }
    else if (typeline == 'visibleDot') {

        c=drawing.circle(8).x(first_point.x - 4).y(first_point.y - 4).fill(color).stroke({
            width: 1,
            color: 'black',
        });
        a = drawing.circle(20).x(first_point.x - 10).y(first_point.y - 10).fill('transparent').stroke({
            width: 1,
            color: 'transparent'
        });
        if(!forDrawInMenu) {
            var name;
            name = prompt("Введите название точки");
            text1 = drawing.text(function (add) {
                add.tspan(name).fill(color).dx(first_point.x + 5).dy(first_point.y - 5);
            });
            addTheElement('dot', name, a, first_point.x, first_point.y, -10, -10, -10, -10, -10, -10, -10, -10, -10, 0, 0, 0, c, text1);
            touchObject(numberOfObjects);
            numberOfObjects++;//Номер последнего элемента массива объектов
        }
        first_point = {};
    }
    else if (typeline == 'unvisibleDot') {

        c = drawing.circle(8).x(first_point.x - 4).y(first_point.y - 4).fill('transparent').stroke({
            width: 1.5,
            color: color,
        });
        a = drawing.circle(20).x(first_point.x - 10).y(first_point.y - 10).fill('transparent').stroke({
            width: 1,
            color: 'transparent'
        });
        if(!forDrawInMenu) {
            var name;
            name = prompt("Введите название точки");
            text1 = drawing.text(function (add) {
                add.tspan(name).fill(color).dx(first_point.x + 5).dy(first_point.y - 5);
            });
            addTheElement('unvisibleDot', name, a, first_point.x, first_point.y, -10, -10, -10, -10, -10, -10, -10, -10, -10, 0, 0, 0, c, text1);
            touchObject(numberOfObjects);
            numberOfObjects++;//Номер последнего элемента массива объектов
        }
        first_point = {};
    }
    else if (typeline == 'horizontalLine' || typeline == 'verticalLine') {//Проверить
        var xx1;
        var yy1;
        var xx2;
        var yy2;
        if (typeline == 'horizontalLine') {
            xx1 = 0;
            yy1 = first_point.y;
            xx2 = 1000;
            yy2 = first_point.y;
        }
        else {
            xx1 = first_point.x;
            yy1 = 0;
            xx2 = first_point.x;
            yy2 = 1000;
        }
        var name;
        var c;
        var a;

        c = drawing.line(xx1, yy1, xx2, yy2).stroke({
            width: widthOfLine,
            color: color,
            dasharray: typeOfHatch
        });
        a = drawing.line(xx1, yy1, xx2, yy2).stroke({
            width: 10,
            color: 'transparent',
        })

        if (!forDrawInMenu) {

            name = prompt("Введите название прямой");
            if (typeline == 'horizontalLine') {
                text1 = drawing.text(function (add) {
                    add.tspan(name).fill(color).dx(20).dy(first_point.y - 5);
                });
            }//Подпись
            else {
                text1 = drawing.text(function (add) {
                    add.tspan(name).fill(color).dx(first_point.x).dy(20);
                });
            }
            if (typeline == 'horizontalLine')
                addTheElement('simpleline', name, a, xx1, yy1, xx2, yy2,
                    -1, -1, -1, -1, (xx1 + xx2) / 2, (yy1 + yy2) / 2, -1, 0, 1, yy1, c, text1);
            else
                addTheElement('simpleline', name, a, xx1, yy1, xx2, yy2,
                    -1, -1, -1, -1, (xx1 + xx2) / 2, (yy1 + yy2) / 2, -1, 1, 0, xx1, c, text1);
            touchObject(numberOfObjects);
            numberOfObjects++;//Индекс последнего объекта в массиве
        }
        else{
            object[jObject].type = a;
            object[jObject].visibleObject = c;
        }

        first_point = {};
    }//Проверить как будут изменяться коэффициенты A, B, C после инвертироания осей.
    else if (typeline == 'line') {
        c = drawing.line(first_point.x, first_point.y, posX, posY).stroke({
            width: widthOfLine,
            color: color,
            dasharray: typeOfLine
        });
        a = drawing.line(first_point.x, first_point.y, posX, posY).stroke({
            width: 10,
            color: 'transparent',
        });
        console.log("fpX:  "+first_point.x+"   fpy:  "+first_point.y +"  posX:   "+posX+"  posY:   "+posY);

        if(!forDrawInMenu) {//не для рисования в интерактивном меню
            var name;
            name = prompt("Введите название отрезка");
            A = transformFromMachineToUser(posY) - transformFromMachineToUser(first_point.y);
            B = -(posX - first_point.x);
            C = -A * first_point.x - B * transformFromMachineToUser(first_point.y);
            text1 = drawing.text(function (add) {
                var dxx = first_point.x, dyy = first_point.y;
                if (B / A < 0) {
                    if (B / A < Math.PI) {
                        dxx = first_point.x - 23;
                    }
                    else
                        dyy = first_point.y - 20;
                }
                else {
                    dyy = first_point.y - 5;
                }
                add.tspan(name).fill(color).dx(dxx)
                    .dy(dyy);
            })//.rotate(-SVG.math.deg(Math.atan(-A/B)));
            addTheElement("line", name, a, first_point.x, first_point.y, posX, posY,
                -10, -10, -10, -10, (first_point.x + posX) / 2, (first_point.y + posY) / 2, -1, A, B, C, c, text1);
            touchObject(numberOfObjects);
            numberOfObjects++;
            jObject = -1;
            jObject2 = -1;
            //node = document.getElementById("drawing").innerHTML;
            //var tak = {code:object[1]};
            //$.post("http://webtute.ru/editor.php?a=store&id=3", tak, function (json) { alert (json); },
            //    'json');
            //alert(node.innerHTML);
            drawingAdress.off('mousemove', elastic);//резинка

        }
        else{
            A = posY - first_point.y;
            B = posX - first_point.x;
            C = -A * first_point.x - B * first_point.y;
            object[jObject].x1 = first_point.x;
            object[jObject].x2 = posX;
            object[jObject].y1 = first_point.y;
            object[jObject].y2 = posY;
            object[jObject].y2 = posY;
            object[jObject].midX = (first_point.x + posX) / 2;
            object[jObject].midY = (first_point.y + posY) / 2;
            object[jObject].A = A;
            object[jObject].B = B;
            object[jObject].C = C;
            object[jObject].visibleObject = c;
            object[jObject].type = a;
            object[jObject].colorObj = color;
            object[jObject].typeLineObj = typeOfHatch;
            text1 = drawing.text(function (add) {
                var dxx = first_point.x, dyy = first_point.y;
                if (B / A < 0) {
                    if (B / A < Math.PI) {
                        dxx = first_point.x - 23;
                    }
                    else
                        dyy = first_point.y - 20;
                }
                else {
                    dyy = first_point.y - 5;
                }
                add.tspan(object[jObject].name).fill(color).dx(dxx)
                    .dy(dyy);
            })//.rotate(-SVG.math.deg(Math.atan(-A/B)));
            object[jObject].text = text1;
            touchObject(jObject);
        }
        //alert();
        first_point={};

    }
    else if (typeline == 'circleR') {

        if(!forDrawInMenu) {
            var name;
            r = prompt('Введите радиус окружности');
            r = parseFloat(r);
            name = prompt("Введите название окружности");

            var c = drawing.circle(r * 2).x(first_point.x - r).y(first_point.y - r).fill('none').stroke({
                width: widthOfLine,
                color: color,
                dasharray:typeOfLine
            });
            var a = drawing.circle(r * 2).x(first_point.x - r).y(first_point.y - r).fill('none').stroke({
                width: 10,
                color: 'transparent'
            });
            console.log("fpX:  "+first_point.x+"   fpy:  "+first_point.y +"  posX:   "+posX+"  posY:   "+posY);
            text1 = drawing.text(function (add) {
                add.tspan(name).fill(color).dx(first_point.x + r).dy(first_point.y - r);
            }).rotate(-SVG.math.deg(Math.atan(-A / B)));
            //console.log('dfsdf'fir+r);
            addTheElement('circle', name, a, first_point.x, first_point.y, first_point.x - r, first_point.y, first_point.x, first_point.y - r,
                first_point.x + r, first_point.y, first_point.x, first_point.y + r, r, -1, -1, -1, c, text1);
            touchObject(numberOfObjects);
            numberOfObjects++;//Индекс последнего элемента массива
        }
        else{
            var c = drawing.circle(r * 2).x(first_point.x - r).y(first_point.y - r).fill('none').stroke({
                width: widthOfLine,
                color: color,
                dasharray:typeOfLine
            });
            var a = drawing.circle(r * 2).x(first_point.x - r).y(first_point.y - r).fill('none').stroke({
                width: 10,
                color: 'transparent'
            });
            console.log("fpX:  "+first_point.x+"   fpy:  "+first_point.y +"  posX:   "+posX+"  posY:   "+posY);
            object[jObject].type = a;
            object[jObject].visibleObject = c;
            touchObject(jObject);
        }
        first_point = {};
    }
    else if (typeline == 'circle') {
        if(!forDrawInMenu) {
            var name;
            name = prompt("Введите подпись окружности");
            r = Math.sqrt(Math.pow(posX - first_point.x, 2) + Math.pow(posY - first_point.y, 2));//чтобы много раз не считать радиус
            var c = drawing.circle(r * 2).x(first_point.x - r).y(first_point.y - r).fill('none').stroke({
                width: widthOfLine,
                color: color,
                dasharray:typeOfLine
            });
            var a = drawing.circle(r * 2).x(first_point.x - r).y(first_point.y - r).fill('none').stroke({
                width: 10,
                color: 'transparent'
            });
            var text1 = drawing.text(function (add) {
                add.tspan(name).fill(color).dx(first_point.x + r).dy(first_point.y - r);
            }).rotate(-SVG.math.deg(Math.atan(-A / B)));
            addTheElement('circle', name, a, first_point.x, first_point.y, first_point.x - r, first_point.y, first_point.x, first_point.y - r,
                first_point.x + r, first_point.y, first_point.x, first_point.y + r, r, -1, -1, -1, c, text1);
            touchObject(numberOfObjects);
            numberOfObjects++;//Индекс последнего объекта в массиве
            drawingAdress.off('mousemove', elastic);//резинка
        }
        else{


            var c = drawing.circle(object[jObject].R * 2).x(first_point.x - object[jObject].R).y(first_point.y - object[jObject].R).fill('none').stroke({
                width: widthOfLine,
                color: color,
                dasharray:typeOfLine
            });
            var a = drawing.circle(object[jObject].R * 2).x(first_point.x - object[jObject].R).y(first_point.y - object[jObject].R).fill('none').stroke({
                width: 10,
                color: 'transparent'
            });
            var text1 = drawing.text(function (add) {
                add.tspan(object[jObject].name).fill(color).dx(parseFloat(first_point.x) + parseFloat(object[jObject].R)).dy(parseFloat(first_point.y) - parseFloat(object[jObject].R));
            })//.rotate(-SVG.math.deg(Math.atan(-A / B)));
            object[jObject].type = a;
            object[jObject].visibleObject = c;
            object[jObject].text = text1;
            var xHelp = parseFloat(first_point.x);
            var yHelp = parseFloat(first_point.y);
            var Rhelp = parseFloat(object[jObject].R);
            object[jObject].x1 = xHelp;
            object[jObject].y1 = yHelp;
            object[jObject].x2 = xHelp - Rhelp;
            object[jObject].y2 = yHelp;
            object[jObject].x3 = xHelp;
            object[jObject].y3 = yHelp - Rhelp;
            object[jObject].x4 = xHelp + Rhelp;
            object[jObject].y4 = yHelp;
            object[jObject].midX = xHelp;
            object[jObject].midY = yHelp + Rhelp;
            touchObject(jObject);
        }
        first_point = {};
    }
    else if (typeline == 'simpleline') {
        var name;
        if (posX == first_point.x) {
            posY = 0;
            first_point.y = 1000;
        }
        else if (posY == first_point.y) {
            posX = 0;
            first_point.x = 1000;
        }
        else {
            console.log('в присвоении точек')
            xx = 1000;
            yy = (-(first_point.y - posY) * xx + (first_point.y - posY) * first_point.x + (posX - first_point.x) * first_point.y) / (posX - first_point.x);
            first_point.x = xx;
            first_point.y = yy;
            xx = 0;
            yy = (-(first_point.y - posY) * xx + (first_point.y - posY) * first_point.x + (posX - first_point.x) * first_point.y) / (posX - first_point.x);
            posX = 0;
            posY = yy;
        }
        c = drawing.line(first_point.x, first_point.y, posX, posY).stroke({
            width: widthOfLine,
            color: color,
            dasharray: typeOfHatch
        });
        a = drawing.line(first_point.x, first_point.y, posX, posY).stroke({
            width: 10,
            color: 'transparent',
        })

        if(!forDrawInMenu) {
            name = prompt("Введите название прямой");
            A = transformFromMachineToUser(posY) - transformFromMachineToUser(first_point.y);
            B = -(posX - first_point.x);
            C = -A * first_point.x - B * transformFromMachineToUser(first_point.y);
            text1 = drawing.text(function (add) {
                //var dxx=()/A;
                //console.log(dxx);
                add.tspan(name).fill(color).dx(first_point.x-30)
                    .dy(first_point.y-30);
            });
            addTheElement('simpleline', name, a, first_point.x, first_point.y, posX, posY, -10, -10, -10, -10, -10, -10, -10, A, B, C, c, text1);
            touchObject(numberOfObjects);
            numberOfObjects++;//Индекс последнего объекта в массиве
            drawingAdress.off('mousemove', elastic);//резинка
        }
        else{
            object[jObject].type = a;
            object[jObject].visibleObject = c;
            //A = posY - first_point.y;
            //B = posX - first_point.x;
            //C = -A * first_point.x - B * first_point.y;
            //object[jObject].A = A;
            //object[jObject].B = B;
            //object[jObject].C = C;
        }
        first_point = {};
    }//ПРоверить
    else if (typeline == 'normal') {
        var xx1 = 1000;
        var yy1;
        var xx2 = 0;
        var yy2;
        yy1 = (object[jObject2].B * (first_point.x - xx1)) / object[jObject2].A + first_point.y;
        yy2 = (object[jObject2].B * (first_point.x - xx2)) / object[jObject2].A + first_point.y;
        var name;
        //console.log(object[jObject].x2+ "       " + object[jObject].y2 + "     " + object[jObject]);
        c = drawing.line(xx1, yy1, xx2, yy2).stroke({
            width: widthOfLine,
            color: color,
            dasharray: typeOfHatch
        });
        a = drawing.line(xx1, yy1, xx2, yy2).stroke({
            width: 10,
            color: 'transparent',
        })

        if (!forDrawInMenu) {

            name = prompt("Введите название прямой");
            A = transformFromMachineToUser(yy2) - transformFromMachineToUser(yy1);
            B = -(xx2 - xx1);
            C = -A * xx1 - B * transformFromMachineToUser(yy1);
            text1 = drawing.text(function (add) {
                //var dxx=()/A;
                //console.log(dxx);
                add.tspan(name).fill(color).dx(first_point.x-30)
                    .dy(first_point.y-30);
            });
            addTheElement('simpleline', name, a, xx1, yy1, xx2, yy2, -10, -10, -10, -10, -10, -10, -10, A, B, C, c, text1);
            touchObject(numberOfObjects);
            numberOfObjects++;//Индекс последнего объекта в массиве
        }
        else{
            object[jObject].type = a;
            object[jObject].visibleObject = c;
        }
        first_point = {};
        posX = 0;

    }//Допилить подпись
    else if (typeline == 'angle') {
        var p;
        var xx1 = 0;
        var yy1;
        var xx2 = 1000;
        var yy2;
        var k;
        var b;
        var name;
        k = Math.atan(-object[jObject].A / object[jObject].B) * 180 / Math.PI;
        console.log('угол наклона' + k);
        var angle = prompt("Введите угол");
        angle = parseFloat(angle);
        k = k + angle;//конечный угол поворота
        console.log('конечный угол поворота' + k);
        p = -Math.tan(k * Math.PI / 180);// k готова для подстановки в уравение y=kx+b
        k = p;
        console.log("Значение тангенса: " + k);
        b = first_point.y - k * first_point.x;
        yy2 = k * xx2 + b;
        yy1 = k * xx1 + b;
        name = prompt("Введите название прямой");
        if (style == "slim") {
            c = drawing.line(xx1, yy1, xx2, yy2).stroke({
                width: 1,
                color: color,
            });
            a = drawing.line(xx1, yy1, xx2, yy2).stroke({
                width: 10,
                color: 'transparent',
            });
        }
        else if (style == "dashed") {
            c = drawing.line(xx1, yy1, xx2, yy2).stroke({
                width: 1,
                color: color,
                dasharray: '25, 25, 5, 20'
            });
            a = drawing.line(xx1, yy1, xx2, yy2).stroke({
                width: 10,
                color: 'transparent',
            });
        }
        else if (style == 'doted') {
            c = drawing.line(xx1, yy1, xx2, yy2).stroke({
                width: 1,
                color: color,
                dasharray: '20, 20'
            });
            a = drawing.line(xx1, yy1, xx2, yy2).stroke({
                width: 10,
                color: 'transparent',
            });
        }
        else if (style == 'fat') {
            c = drawing.line(xx1, yy1, xx2, yy2).stroke({
                width: 3,
                color: color,
            });
            a = drawing.line(xx1, yy1, xx2, yy2).stroke({
                width: 10,
                color: 'transparent',
            });
        }
        A=transformFromMachineToUser(yy2) - transformFromMachineToUser(yy1);
        B=-(xx2-xx1);
        C = -A * xx1 - B * transformFromMachineToUser(yy1);
        text1 = drawing.text(function (add) {
            var dxx = first_point.x, dyy = first_point.y;
            if (B/A < 0){
                if(B/A < Math.PI){
                    dxx = first_point.x - 23;
                }
                else
                    dyy = first_point.y -20;
            }
            else {
                dyy = first_point.y - 5;
            }
            add.tspan(name).fill(color).dx(dxx)
                .dy(dyy);
        })
        addTheElement('angle', name, a, xx1, yy1, xx2, yy2,
            -1, -1, -1, -1, (xx1 + xx2) / 2, (yy1 + yy2) / 2, -1, A, B, C, c, text1);
        first_point = {};
        touchObject(numberOfObjects);
        numberOfObjects++;
    }
    else if (typeline == "parallel") {//параллельные прямые
        var xx1 = 0;
        var yy1;
        var xx2 = 1000;
        var yy2;
        var k = object[jObject1].A / object[jObject1].B;
        b = first_point.y - first_point.x * k;
        yy1 = k * xx1 + b;
        yy2 = k * xx2 + b;
        name = prompt("Введите название прямой");
        if (style == "slim") {
            c = drawing.line(xx1, yy1, xx2, yy2).stroke({
                width: 1,
                color: color,
            });
            a = drawing.line(xx1, yy1, xx2, yy2).stroke({
                width: 10,
                color: 'transparent',
            });
        }
        else if (style == "dashed") {
            c = drawing.line(xx1, yy1, xx2, yy2).stroke({
                width: 1,
                color: color,
                dasharray: '25, 25, 5, 20'
            });
            a = drawing.line(xx1, yy1, xx2, yy2).stroke({
                width: 10,
                color: 'transparent',
            });
        }
        else if (style == 'doted') {
            c = drawing.line(xx1, yy1, xx2, yy2).stroke({
                width: 1,
                color: color,
                dasharray: '20, 20'
            });
            a = drawing.line(xx1, yy1, xx2, yy2).stroke({
                width: 10,
                color: 'transparent',
            });
        }
        else if (style == 'fat') {
            c = drawing.line(xx1, yy1, xx2, yy2).stroke({
                width: 3,
                color: color,
            });
            a = drawing.line(xx1, yy1, xx2, yy2).stroke({
                width: 10,
                color: 'transparent',
            });
        }
        A=transformFromMachineToUser(yy2) - transformFromMachineToUser(yy1);
        B=-(xx2 - xx1);
        C = -A * xx1 - B * transformFromMachineToUser(yy1);
        text1 = drawing.text(function (add) {
            var dxx = first_point.x, dyy = first_point.y;
            if (B/A < 0){
                if(B/A < Math.PI){
                    dxx = first_point.x - 23;
                }
                else
                    dyy = first_point.y -20;
            }
            else {
                dyy = first_point.y - 5;
            }
            add.tspan(name).fill(color).dx(dxx)
                .dy(dyy);
        })
        addTheElement('parallel', name, a, xx1, yy1, xx2, yy2,
            -1, -1, -1, -1, (xx1 + xx2) / 2, (yy1 + yy2) / 2, -1, A, B, C, c, text1);
        first_point = {};
        touchObject(numberOfObjects);
        numberOfObjects++//Индекс последнего объекта в массиве
    }
    else if (typeline == 'horizontalSize') {

        drawingAdress.on('click', drawClickSize);
        drawingAdress.on('mousemove', drawMmove);
        name1 = prompt("Введите подпись размера");
    }
    else if (typeline == 'angularSize') {

        drawingAdress.on('click', drawClickSize);
        drawingAdress.on('mousemove', drawMmove);
        name1 = prompt("Введите подпись размера");

    }
    else if (typeline == 'verticalSize') {

        drawingAdress.on('click', drawClickSize);
        drawingAdress.on('mousemove', drawMmove);
        name1 = prompt("Введите подпись размера");
    }
    else if (typeline == 'arc') {
        if (second_point.x && second_point.y) {
            drawing.path('M' + second_point.x + ' ' + second_point.y + 'Q' + first_point.x + ' '
                + first_point.y + ' ' + posX + ' ' + posY).fill('none').stroke({widht: 1, color: "#000"});
            first_point = {};
            second_point = {};
        }
        else {
            second_point = {x: first_point.x, y: first_point.y};
            first_point.x = posX;
            first_point.y = posY;
            posX = -1;
            posY = -1;
        }
    }
    else if (typeline == 'angleSize'){

        drawingAdress.on('click', drawClickSize);
        drawingAdress.on('mousemove', drawMmove);
        name1 = prompt("Введите подпись размера");

    }
    else
        first_point = {};
}//Переделать на конструкцию Switch-case

function _hoverEvent(event) {
    var element = $(event.currentTarget);
    element.toggleClass('hover');
}

function settypeline(typeline1) {
    //устанавливаем параметры линий и фугур локально, тоесть для каждого параметра своя функция
    //тип линии, стиль, цвет
    typeline = typeline1;
    if(typeline1=='parallel'|| typeline1=='normal')
    {
        firstUse=0;
    }
}//Устанавливаем тип линии, который будем рисовать, или устанавливаем тип инструмента

function setstyle(style1) {
    //тип линии, стиль, цвет
    if (style1 == "slim") {
        widthOfLine = 1;
        typeOfLine = '';
        typeOfHatch = 'slim';
    }
    else if (style1 == "dashed") {
        widthOfLine = 1;
        typeOfLine = '25, 25, 5, 20';
        typeOfHatch = 'dashed';
    }
    else if (style1 == 'doted') {
        widthOfLine = 1;
        typeOfLine = '20, 20';
        typeOfHatch = 'doted';
    }
    else if (style1 == 'fat') {
        widthOfLine = 3;
        typeOfLine = '';
        typeOfHatch = 'fat';
    }
}//Устанавливает стиль выполнения объектов чертежа(штрих-пунктирная, пунктирная, тонкая, толстая линия).

function setcolor(color1) {
    //тип линии, стиль, цвет
    color = color1;
}