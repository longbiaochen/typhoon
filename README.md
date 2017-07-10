# Typhoon

## 数据统计
- 记录数：376,703,725 (近4亿条)
- 时间：2016/09/01-—2016/09/30
- 平均每辆车产生记录数：68,666
- 平均每辆车每天产生记录数：2,289
- GPS定位精度：10m https://zh.wikipedia.org/wiki/全球定位系统

## 约定常数
- 厦门岛内GPS范围 [Top, Bottom, Right, Left]： 
  - T = 24561485
  - B = 24423250
  - R = 118198504
  - L = 118064743
- 厦门市GPS范围 [Top, Bottom, Right, Left]： 
  - T = 24619351
  - B = 24369406
  - R = 118265022
  - L = 117990364
- GPS中心点：C = [(T+B)/2, (L+R)/2]
- 测量长度 [Width, Height]：
  - Width = 13550
  - Height = 15388
- 起止时间戳（考虑时区+8）：
  - START_TIME = 1472659200 (2016/09/01 00:00:00)
  - END_TIME = 1475251199 (2016/09/30 12:59:59)

## 常用转换代码
- Matlab时间转换：
    ```matlab
    START_TIME = posixtime(datetime('09/01/2016 00:00','TimeZone','local','InputFormat','MM/dd/uuuu HH:mm')); 
    END_TIME = posixtime(datetime('09/30/2016 23:59','TimeZone','local','InputFormat','MM/dd/uuuu HH:mm'));
    ```
