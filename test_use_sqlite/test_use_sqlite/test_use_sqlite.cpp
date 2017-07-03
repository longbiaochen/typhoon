// Win32Project2.cpp : 定义 DLL 应用程序的导出函数。
//

#include "stdafx.h"


// : 定义控制台应用程序的入口点。
//initialize
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <sqlite3.h>
#include <time.h>
#include <iomanip>
#include <sstream>
#include <iostream>
using namespace std;
sqlite3 *db;
sqlite3_stmt *stmt;
char *msg = 0;
time_t timestamp, vehicle_timestamp;
struct tm tm1;
struct tm tm2;

//strptime在windows下的运用替换
extern "C" char* strptime(const char* s,
	const char* f,
	struct tm* tm) {
	// Isn't the C++ standard lib nice? std::get_time is defined such that its
	// format parameters are the exact same as strptime. Of course, we have to
	// create a string stream first, and imbue it with the current C locale, and
	// we also have to make sure we return the right things if it fails, or
	// if it succeeds, but this is still far simpler an implementation than any
	// of the versions in any of the C standard libraries.
	std::istringstream input(s);
	input.imbue(std::locale(setlocale(LC_ALL, nullptr)));
	input >> std::get_time(tm, f);
	if (input.fail()) {
		return nullptr;
	}
	return (char*)(s + input.tellg());
}

//define function callback 
static int callback(void *data, int ncol, char **values, char **names) {

	strptime(values[6], "%Y - %m - %d %H:%M : %S", &tm1);//对第7个值 形如"%Y - %m - %d %H:%M : %S"的时间 放入tm1
	vehicle_timestamp = mktime(&tm1);//对tm1进行mktime转变为unix时间戳放入vehicle_timestamp

	strptime(values[7], "%Y - %m - %d %H:%M : %S", &tm2); //类似上
	timestamp = mktime(&tm2);

	sqlite3_reset(stmt);
	sqlite3_bind_int64(stmt, 1, vehicle_timestamp); //将新得到的值vehicle_timestamp放入stmt里update语句中 第1个问号的位置
	sqlite3_bind_int64(stmt, 2, timestamp);//将新得到的值timestamp放入stmt里update语句中 第2个问号的位置
	sqlite3_step(stmt);
	return 0;
}

int main(int argc, char* argv[]) {
	int n;
	time_t launch = time(0);//标记开始时间

	n = sqlite3_open("D:/sqlite-tools-win32-x86-3190300/1234.db", &db);//打开db数据库
	if (n != SQLITE_OK)
	{
		printf("Cant open db.\n");
	}
	const char *update = "update info set vehicle_timestamp = ?, timestamp = ?;";//定义update语句
	sqlite3_prepare_v2(db, update, (int)strlen(update), &stmt, 0);//准备 update语句放入stmt (?)

	//sqlite3_exec(db, "begin;", 0, 0, 0);
	string strsql = "select * from info;";
	n = sqlite3_exec(db, strsql.c_str(), callback, NULL, &msg);//执行sql后执行callback
	if (n != SQLITE_OK)
	{
		printf("Cant exec.\n");
	}
	sqlite3_finalize(stmt);

	//sqlite3_exec(db, "commit;", 0, 0, 0);
	sqlite3_close(db);//关闭数据库

	time_t done = time(0);//标记结束时间
	printf("%lu\n", (done - launch));//打印出程序执行所用时间
	printf("Done.\n");//end
	getchar();
}


