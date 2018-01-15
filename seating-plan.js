
//set some students temporarily in students textarea
$("#studentsList").val('Sami Milla Heli Juuso Aleksi Mikko Niilo Elle Joona Aada Anna Silja Aatu Tuukka Kiia-Sofia Juho Viivi Sallamari')
$("#seatingRows").val('4');
$("#seatingColumns").val('6');

var students = addStudents();

//prevents page reloading after creating the order
$('#settingsForm').submit(function (e) {
    e.preventDefault();

    //LOADING TEXT NOT WORKING
    var loadingText = new Konva.Text({
                  x: 200, 
                  y: 50,
                  name: "",
                  text: "Some math happening... Please wait.",
                  fontSize: 26,
                  fontFamily: 'Calibri',
                  fill: 'black'
                });
    stage.add(loadingLayer);
    loadingLayer.add(loadingText);
    loadingLayer.draw();

    createBestOrder();

    loadingText.setAttr('text', "");
    loadingLayer.draw();

    return false;
});

const WIDTH = 800;
const HEIGHT = 500;
const ITERATEAMOUNT = 50000;
const RECTANGLECOLOR = '#C4DBF1';
const RECTANGLEDRAGCOLOR = "#515A62"
var CROPSTUDENTNAMES = true;

var POINTS;

var rulesAmount = 1;
var rulesTotalAmount = 1;

//KONVA
var stage = new Konva.Stage({
    container: 'container',
    width: WIDTH,
    height: HEIGHT
});
var rectangleLayer = new Konva.Layer();
var loadingLayer = new Konva.Layer();

stage.add(rectangleLayer);
stage.add(loadingLayer);

//create rectangle to stage
var orderAreaBorders = new Konva.Rect({
      x: 0,
      y: 0,
      width: WIDTH,
      height: HEIGHT,
      //fill: 'green',
      stroke: 'black',
      strokeWidth: 2
    });
loadingLayer.add(orderAreaBorders);
loadingLayer.draw();



//NOT USED
function startLoadingAnimation(animLayer){  
    var hexagon = new Konva.RegularPolygon({
        x: stage.getWidth() / 2,
        y: 50,
        sides: 6,
        radius: 20,
        fill: 'red',
        stroke: 'black',
        strokeWidth: 4
    });

    animLayer.add(hexagon);
    stage.add(animLayer);

    var amplitude = 100;
    var period = 2000;
    // in ms
    var centerX = stage.getWidth() / 2;

    var anim = new Konva.Animation(function(frame) {
        hexagon.setX(amplitude * Math.sin(frame.time * 2 * Math.PI / period) + centerX);
    }, animLayer);

    anim.start();

    return animLayer
}

//Function for collecting students to list from textarea
function addStudents(){
    var studentsString = $("#studentsList").val();
    students = studentsString.split(' ');
    var columns = +$("#seatingColumns" ).val();

    if(CROPSTUDENTNAMES){
        var cropLen;
        if(columns < 7){
            cropLen = 11;
        }
        else{
            cropLen = 7;
        }
        for(var i = 0 ; i < students.length ; i ++){
            if(students[i].length > cropLen){
                students[i] = students[i].slice(0, cropLen);
            }
        }
    }
    //shuffle students
    students = shuffle(students).slice();
    return students;
}

function createBestOrder(animation){

    var bestOrder;
    var bestOrderVal = 0;

    var values = createGrid();
    POINTS = values[0].slice();
    var rows = values[1];
    var columns  = values[2];

    //if rules, then iterate
    if(rulesAmount > 1){
        var i = 0
        while(i < ITERATEAMOUNT){
            console.log("Iterating!");
            var students = addStudents();
            var order = makeOrder(students, rows, columns);
            if(order.value >= bestOrderVal){

                bestOrderVal = order.value;
                bestOrder = order;
                if(bestOrderVal == rulesAmount - 1){
                    console.log("All rules works!");
                    break
                }
            }
        i++
        }
        drawOrder(bestOrder, rows, columns);
        // console.log(bestOrderVal);
    }
    else{
        //convert students list to object so it can draw it
        var students = addStudents();
        var order = makeOrder(students, rows, columns);
        drawOrder(order, rows, columns);
    }
}
//create points 
function createGrid(){
    var rows = +$("#seatingRows" ).val();
    var columns = +$("#seatingColumns" ).val();
    var points = [];

    //seat numbers
    var seatNumber = rows * columns;
    var studentAmount = addStudents().length;
    while(studentAmount > seatNumber){
        rows++;
        seatNumber = rows * columns;
    } 
    for(var j = 0; j < rows ; j ++){
         for(var i = 0; i < columns; i++){
            points.push([i, j]);
         }
     }
    return [points, rows, columns]
}
//function for creating seating order
function makeOrder(studentArr, rows, columns){
    var students = studentArr.slice();
    
    //create object for students student has

    var orderObj = {}
    // orderObj.order = students.slice();

    //give each student a point
    var pointsCopy = POINTS.slice();
    EMPTYSEATS = $('#emptySeats').is(':checked'); 
    if(EMPTYSEATS){
        pointsCopy = shuffle(pointsCopy);
    }
    var student = students.pop();
    while(student){
        orderObj[student] = pointsCopy.shift();
        student = students.pop();
    }

    var orderValue = valueOrder(orderObj)
    orderObj.value = orderValue;

    return orderObj;
}
function drawOrder(orderObject, rows, columns){

    //destroy layers
    if(rectangleLayer){
        rectangleLayer.destroy();
    }
    rectangleLayer = new Konva.Layer();

    
    
    //create points
    var yWidth = Math.min((HEIGHT - 200)/rows, 80);
    var rectWidth = 500/columns;
    var xWidth = (WIDTH - columns * rectWidth)/(columns + 1);    
    var rectHeight = Math.min(yWidth - 10, 40);
    var startX = xWidth + rectWidth;
    var startY = 175;
    var seatGroup = [];

    //CREATE ALL SEATS
    for(var j = 0; j < rows ; j ++){
         for(var i = 0; i < columns; i++){
            //console.log(i, j);
            var rectX = WIDTH - (startX + i * (xWidth + rectWidth));
            var rectY = HEIGHT - (startY + j * yWidth);
            // context.strokeRect(rectX, rectY, rectWidth, rectHeight);
            var seat = new Konva.Rect({
                x: rectX,
                y: rectY,
                name: "rectangle" + i + j,
                width: rectWidth,
                height: rectHeight,
                fill: RECTANGLECOLOR,
                stroke: 'black',
                strokeWidth: 1,
                cornerRadius: 1
            });

            var studentText = new Konva.Text({
                  x: rectX + rectWidth/3, 
                  y: rectY + rectHeight/3,
                  name: "student" + i + j,
                  // text: studentName,
                  fontSize: 16,
                  fontFamily: 'Calibri',
                  fill: 'black'
                });
            var group = new Konva.Group({
                name: "seat" + i+ j,
                draggable: true
            });
            group.add(seat);
            group.add(studentText);
            seatGroup.push(group);
            rectangleLayer.add(group);
         }
     }
     // console.log(seatGroup);

    //NAMES
    Object.keys(orderObject).forEach(function(key) {
        var studentName = key;
        var pos = orderObject[key];
        var i = pos[0];
        var j = pos[1];
        var rectX = WIDTH - (startX + i * xWidth);
        var rectY = HEIGHT - (startY + j * yWidth);

        for(var k = 0; k < seatGroup.length ; k ++){
            //add studenttext to corresponding group
            if(seatGroup[k].attrs.name == "seat" + i+ j){
                // seatGroup[k].add(studentText);
                seatGroup[k].children[1].setAttr('text', studentName);

                //adjust text position
                //get text width
                // var textWidth = seatGroup[k].children[1].width();

                // seatGroup[k].children[1].setAttrs({
                //      x: rectX + rectWidth/2 - textWidth/2
                // });
                adjustTextPos(seatGroup[k].children[0], seatGroup[k].children[1]);

            }
        }
    });
    // console.log(seatGroup);

    //DRAG AND DROP LOGIC
    var tempLayer = new Konva.Layer();
    stage.add(tempLayer);

    for(var k = 0; k < seatGroup.length ; k ++){

        var position;
        var startX;
        var startY;

        seatGroup[k].on('dragstart', function(e){
            console.log("Drag Started");
            e.target.moveTo(tempLayer);
            this.children[0].setFill(RECTANGLEDRAGCOLOR);
            rectangleLayer.draw();

        });
        var previousShape;
        seatGroup[k].on("dragmove", function(evt){
            var pos = stage.getPointerPosition();
            var shape = rectangleLayer.getIntersection(pos);
            // position = this.getAbsolutePosition();
            // console.log(position);
            if (previousShape && shape) {
                if(shape && shape.className == "Rect"){
                    if (previousShape !== shape) {
                        // leave from old targer
                        previousShape.fire('dragleave', {
                            type : 'dragleave',
                            target : previousShape,
                            evt : evt.evt
                        }, true);
                        // enter new targer
                        shape.fire('dragenter', {
                            type : 'dragenter',
                            target : shape,
                            evt : evt.evt
                            }, true);
                        previousShape = shape;
                    } 
                    else {
                        previousShape.fire('dragover', {
                            type : 'dragover',
                            target : previousShape,
                            evt : evt.evt
                            }, true);
                    }
                }
                } 
            else if (!previousShape && shape) {
                if(shape && shape.className == "Rect"){
                    previousShape = shape;
                    shape.fire('dragenter', {
                        type : 'dragenter',
                        target : shape,
                        evt : evt.evt
                        }, true);
                } 
                }       
            else if (previousShape && !shape) {
                // if(shape && shape.className == "Rect"){
                    previousShape.fire('dragleave', {
                        type : 'dragleave',
                        target : previousShape,
                        evt : evt.evt
                        }, true);
                    previousShape = undefined;
                    // }
                } 
        });
        seatGroup[k].on("dragend", function(e){
            var pos = stage.getPointerPosition();
            var shape = rectangleLayer.getIntersection(pos);
            this.children[0].setFill(RECTANGLECOLOR);
            
            if (shape) {
                previousShape.fire('drop', {
                    type : 'drop',
                    target : previousShape,
                    evt : e.evt
                }, true);
            }
            else{
                this.setAbsolutePosition({x: 0, y: 0});
                // console.log(this);
            }
            previousShape = undefined;
            e.target.moveTo(rectangleLayer);
            rectangleLayer.draw();
            tempLayer.draw();
        });
        seatGroup[k].on("dragenter", function(e){
            e.target.fill(RECTANGLEDRAGCOLOR);
            // console.log('dragenter ' + e.target.name());
            rectangleLayer.draw();
        });
        seatGroup[k].on("dragleave", function(e){
            e.target.fill(RECTANGLECOLOR);
            // console.log('dragleave ' + e.target.name());
            rectangleLayer.draw();
        });
        seatGroup[k].on("dragover", function(e){
            // console.log('dragover ' + e.target.name());
            rectangleLayer.draw();
        });
        seatGroup[k].on("drop", function(e){   
            // console.log('drop ' + e.target.name());
            e.target.fill(RECTANGLECOLOR)
            //get the groups
            var startGroup = e.evt.dragEndNode;
            var endGroup = this;
            startGroup.setAbsolutePosition({x: 0, y: 0});
            //change text
            var startName = startGroup.children[1].getText();
            var endName = endGroup.children[1].getText();
            startGroup.children[1].getText(endName);
            startGroup.children[1].setAttr('text', endName);
            endGroup.children[1].setAttr('text', startName);

            adjustTextPos(startGroup.children[0], startGroup.children[1]);
            adjustTextPos(endGroup.children[0], endGroup.children[1]);

            tempLayer.draw();
            rectangleLayer.draw();
        });
    }
    stage.add(rectangleLayer);
}

function adjustTextPos(rect, text){
    var rectWidth = rect.width();
    var rectX = rect.x();
    var textWidth = text.width();

    text.setAttrs({
        x: rectX + rectWidth/2 - textWidth/2
    })    
}

function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

function addRule(divName){
  var newdiv = document.createElement('div');

  var studentsString = $("#studentsList").val();
  students = studentsString.split(' ');


  //disable row, studen and column selections
  // $("#studentsList").prop("disabled", true);
  // $("#seatingColumns").prop("disabled", true);
  // $("#seatingRows").prop("disabled", true);

  //create div for rule
  containerDivName = ".rule" + rulesTotalAmount;
  var containerDiv = '<div class = "rule' + rulesTotalAmount + '>" </div>'
  //add that to rules div
  $('.rules').append(containerDiv);

  //FIRST SELECTION (STUDENTSNAME LIST)
  var ruleStudent = '<select name="student">'
  for(var i = 0; i < students.length ; i ++){
    ruleStudent += '<option value="' + students[i] + '">' + students[i] + "</option>";
  }
  ruleStudent += "</select>"
  $('.rules').children().last().append(ruleStudent);


  //SELECTION FOR RULE TYPE
  var id = "ruleType" + rulesTotalAmount;
  var ruleType = '<select name="ruletype" id ="' + id + '"> \
                <option value = "sitsIn"> sits in </option>\
                <option value = "sitsNext" class="selected"> sits next to </option>\
                <option value = "sitsAway"> sits away from </option>\
                </select>'
  $('.rules').children().last().append(ruleType);


  //selection for rows and students
  var idd = "rulePos" + rulesTotalAmount;
  var rulePos = '<select name="rulePos" id = "' + idd + '"</select>'

  $('.rules').children().last().append(rulePos);
  //create rows
    var rowNumber = $("#seatingRows").val();
    var html = ""
    for(var i = 1; i <= rowNumber ; i ++){
        if(i == 1){
            html += '<option value="row' + i + '">' + "frontrow" + "</option>";
        }
        else if (i == rowNumber){
            html += '<option value="row' + i + '">' + "backrow" + "</option>";
        }
        else {
        html += '<option value="row' + i + '">' + "row"+ i + "</option>";
        }
    }
    $('#' + idd).append(html);

  
  $('#ruleType' + rulesTotalAmount).change(function() {
    var type = $(this).val();
    //clear options 
    document.getElementById(idd).options.length = 0;

    if(type == "sitsAway" || type == "sitsNext"){
        var html = ""
        for(var i = 0; i < students.length ; i ++){
        html += '<option value="' + students[i] + '">' + students[i] + "</option>";
        }
        $('#' + idd).append(html);
    }
    else if(type == "sitsIn"){
        //create rows
        var rowNumber = $("#seatingRows").val();
        var html = ""
        for(var i = 1; i <= rowNumber ; i ++){
            if(i == 1){
                html += '<option value="row' + i + '">' + "frontrow" + "</option>";
            }
            else if (i == rowNumber){
                html += '<option value="row' + i + '">' + "backrow" + "</option>";
            }
            else {
            html += '<option value="row' + i + '">' + "row "+ i + "</option>";
            }
        }
        $('#' + idd).append(html);
    }
    // $("#search-form").attr("action", "/search/" + action);
    });
    rulesAmount ++;
    rulesTotalAmount ++;
    console.log("Rules:" + (rulesAmount - 1));

    var removeHTML = '<span class="remove"> X </span>'
    $('.rules').children().last().append(removeHTML);

    $('.rules').children().last().on('click', '.remove', function(){
        $(this).parent().remove();
        rulesAmount --;
        console.log("Rules:" + (rulesAmount - 1));
    });
}

function valueOrder(orderObj){
    var points = 0;


    //value rules
    for(var i = 1 ; i < rulesTotalAmount ; i ++){
        var ruleID = "#ruleType" + i;
        var ruleType = $(ruleID).val()
        var ruleStudentOne = $(ruleID).parent().children().first().val();
        var rulePos = $(ruleID).parent().children().last().prev().val();
        if (ruleType == "sitsIn"){
            points += checkRow(ruleStudentOne, rulePos, orderObj);
        }
        else if (ruleType == "sitsNext"){
            points += checkIfNext(ruleStudentOne, rulePos, orderObj);
        } 
        else if (ruleType == "sitsAway"){
            points += checkIfNotAround(ruleStudentOne, rulePos, orderObj);
        }

    }

    return points
}

function checkRow(student, row, orderObj){
    var rowN = row.slice(3) - 1;
    if(orderObj[student][1] == rowN ){
        return 1
    }
    else{
        return 0
    }
}

function checkIfNext(student1, student2, orderObj){
    //add and -1 number 1 to column coordinate, if there's students2, that's a point
    var oneCoords = orderObj[student1];
    var twoCoords = orderObj[student2];
    //if they are in same row and [0] is -1 or 1 same
    if((oneCoords[1] == twoCoords[1]) && (oneCoords[0] + 1 == twoCoords[0] ||oneCoords[0] - 1 == twoCoords[0])){
        return 1
    }
    else{
        return 0
    }
}

function checkIfNotAround(student1, student2, orderObj){
    //check if coord are not +1 or -1 with the another
    if(checkIfNext(student1, student2, orderObj) == 1){
        return 0
    }
    else{
        return 1
    }
}
// makeOrder();
