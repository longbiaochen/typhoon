import java.text.*;
import java.util.Date;
import java.util.Calendar;
import java.util.Scanner;
import java.awt.event.MouseWheelEvent;
import java.awt.event.MouseWheelListener;
import java.sql.*;

long NORTH = 24584617, SOUTH = 24398989, EAST = 118234385, WEST = 118030402; //东西南北界线
long WIDTH = EAST - WEST, HEIGHT = NORTH - SOUTH; //经纬宽度、长度，用于比例缩小图像
int SW = 800, SH = 800, SZ = 1; //画布宽度、画布高度、绘制圆点的直径
int x, y, lat, lng, status, cnt;
String query;
Date date;
SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss"); //用于格式化日期
SimpleDateFormat psdf = new SimpleDateFormat("yyyy-MM-dd HH:mm"); //sdf用于select，psdf用于显示的时间
Connection conn = null; //新建数据库连接对象名
Statement stmt = null; //新建SQL语句对象名
ResultSet rs = null;


void setup() {
  size(800, 800);
  background(0); //背景颜色为黑色
  noStroke(); //去除绘制的轮廓
  // connect to database
  try {
    Class.forName("org.sqlite.JDBC");
    conn = DriverManager.getConnection("jdbc:sqlite:/Users/Longbiao/Projects/typhoon/taxi.db"); //设置数据库类型和路径并赋值给c
    conn.setAutoCommit(false); //设置自动提交为false
    stmt = conn.createStatement(); //新建SQL语句对象并赋值给stmt

    date = sdf.parse("2016-09-14 18:00:00"); //预设开始时间，sdf.parse要求被写在try catch中
  } 
  catch (Exception e) {
    println(e.getClass().getName() + ": " + e.getMessage());
    exit();
  }
}

void draw() {
  fill(0, 30); //设置画布的透明度
  rect(0, 0, SW, SH); //绘制画布
  fill(255, 0, 0, 255); //设置绘制圆点的颜色、透明度
  query = String.format("SELECT * FROM trajectory WHERE timestamp >= %d AND timestamp < %d;", date.getTime()/1000, (date.getTime() + 60000)/1000);
  //println(query);
  try {
    cnt = 0;
    rs = stmt.executeQuery(query);
    while (rs.next()) { //读取数据
      status = rs.getInt("status");
      if (status == 1) {
        lat = rs.getInt("latitude");
        lng = rs.getInt("longitude");
        y = (int)((NORTH - lat) * SH / HEIGHT); //计算圆点圆心的横纵坐标
        x = (int)((lng - WEST) * SW / WIDTH);
        ellipse(x, y, SZ, SZ); //绘制圆点
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
  text("FPR: "+ frameRate, 660, 40);
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