// Win32Project2.cpp : ���� DLL Ӧ�ó���ĵ���������
//

#include "stdafx.h"


// : �������̨Ӧ�ó������ڵ㡣
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

//strptime��windows�µ������滻
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

	strptime(values[6], "%Y - %m - %d %H:%M : %S", &tm1);//�Ե�7��ֵ ����"%Y - %m - %d %H:%M : %S"��ʱ�� ����tm1
	vehicle_timestamp = mktime(&tm1);//��tm1����mktimeת��Ϊunixʱ�������vehicle_timestamp

	strptime(values[7], "%Y - %m - %d %H:%M : %S", &tm2); //������
	timestamp = mktime(&tm2);

	sqlite3_reset(stmt);
	sqlite3_bind_int64(stmt, 1, vehicle_timestamp); //���µõ���ֵvehicle_timestamp����stmt��update����� ��1���ʺŵ�λ��
	sqlite3_bind_int64(stmt, 2, timestamp);//���µõ���ֵtimestamp����stmt��update����� ��2���ʺŵ�λ��
	sqlite3_step(stmt);
	return 0;
}

int main(int argc, char* argv[]) {
	int n;
	time_t launch = time(0);//��ǿ�ʼʱ��

	n = sqlite3_open("D:/sqlite-tools-win32-x86-3190300/1234.db", &db);//��db���ݿ�
	if (n != SQLITE_OK)
	{
		printf("Cant open db.\n");
	}
	const char *update = "update info set vehicle_timestamp = ?, timestamp = ?;";//����update���
	sqlite3_prepare_v2(db, update, (int)strlen(update), &stmt, 0);//׼�� update������stmt (?)

	//sqlite3_exec(db, "begin;", 0, 0, 0);
	string strsql = "select * from info;";
	n = sqlite3_exec(db, strsql.c_str(), callback, NULL, &msg);//ִ��sql��ִ��callback
	if (n != SQLITE_OK)
	{
		printf("Cant exec.\n");
	}
	sqlite3_finalize(stmt);

	//sqlite3_exec(db, "commit;", 0, 0, 0);
	sqlite3_close(db);//�ر����ݿ�

	time_t done = time(0);//��ǽ���ʱ��
	printf("%lu\n", (done - launch));//��ӡ������ִ������ʱ��
	printf("Done.\n");//end
	getchar();
}


