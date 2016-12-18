import java.text.*;
import java.util.Date;
import java.util.Calendar;
import java.util.Scanner;
import java.awt.event.MouseWheelEvent;
import java.awt.event.MouseWheelListener;
import java.sql.*;
float NORTH = 24.616651115569763, 
  EAST = 118.26972260156253, 
  WEST = 117.99506439843753, 
  SOUTH = 24.366706529319718;
float WIDTH = EAST - WEST, 
  HEIGHT = NORTH - SOUTH, 
  CENTER = (EAST + WEST) / 2, 
  MIDDLE = (NORTH + SOUTH) / 2;
int SIZE = 800, PS=2;
float x, y, lat, lng, status, speed, cnt;
String query;
Date date;
SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss"); //用于格式化日期
SimpleDateFormat psdf = new SimpleDateFormat("yyyy-MM-dd HH:mm"); //sdf用于select，psdf用于显示的时间
Connection conn = null; //新建数据库连接对象名
Statement stmt = null; //新建SQL语句对象名
ResultSet rs = null;
PImage img;


void setup() {
  size(800, 800);
  background(0); //背景颜色为黑色
  noStroke(); //去除绘制的轮廓
  img = loadImage("bg.png");
  // connect to database
  try {
    Class.forName("org.sqlite.JDBC");
    conn = DriverManager.getConnection("jdbc:sqlite:/Users/Longbiao/Projects/typhoon/taxi.db"); //设置数据库类型和路径并赋值给c
    conn.setAutoCommit(false); //设置自动提交为false
    stmt = conn.createStatement(); //新建SQL语句对象并赋值给stmt
    date = sdf.parse("2016-09-14 23:00:00"); //预设开始时间，sdf.parse要求被写在try catch中
  } 
  catch (Exception e) {
    println(e.getClass().getName() + ": " + e.getMessage());
    exit();
  }
}

void draw() {
  tint(255, 30);
  image(img, 0, 0, SIZE, SIZE);
  query = String.format("SELECT * FROM trajectory WHERE timestamp >= %d AND timestamp < %d;", date.getTime()/1000, (date.getTime() + 60000)/1000);
  try {
    cnt = 0;
    rs = stmt.executeQuery(query);
    fill(255, 0, 0);
    while (rs.next()) { //读取数据
      status = rs.getInt("status");
      speed = rs.getInt("speed");

      if (status == 1 && speed > 0) {
        lat = rs.getInt("latitude");
        lng = rs.getInt("longitude");
        x = (lng / 1e6 - WEST + .0047) / WIDTH * SIZE;
        y = (NORTH - lat / 1e6 + .0027) / HEIGHT * SIZE;
        ellipse(x, y, PS, PS); //绘制圆点
        cnt += 1;
      }
    }
  }
  catch(Exception e) {
    println(e.getClass().getName() + ": " + e.getMessage());
  }

  textAlign(LEFT);
  textSize(24); 
  fill(255);
  text(psdf.format(date) + "    " + "Xiamen Island", 10, 40);
  text("FPS: "+ int(frameRate), 660, 40);
  text("Taxis: " + cnt, 460, 40);

  date = new Date(date.getTime() + 60000); //下一分钟
  //noLoop();
}

void mouseReleased() { //鼠标放开时循环执行draw函数
  loop();
}

void mousePressed() { //鼠标点击时停止执行draw函数
  noLoop();
}