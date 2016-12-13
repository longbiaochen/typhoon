#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <sqlite3.h>
#include <time.h>


sqlite3 *db;
sqlite3_stmt *stmt;
char *msg = 0;
int rs, vs, status, rowid;
time_t timestamp;
struct tm tm;


static int callback(void *data, int ncol, char **values, char **names){
    rs = atoi(values[19]);
    vs = atoi(values[11]);
    status = rs ? rs:(vs & 768) / 768;
    strptime(values[0], "%Y-%m-%d %H:%M:%S", &tm);
    timestamp = mktime(&tm);
    rowid = atoi(values[23]);
    
    sqlite3_reset(stmt);
    sqlite3_bind_int(stmt,1,status);
    sqlite3_bind_int64(stmt,2,timestamp);
    sqlite3_bind_int(stmt,3,rowid);
    sqlite3_step(stmt);
    
    return 0;
}

int main(int argc, char* argv[]){
    
    time_t launch = time(0);
    
    sqlite3_open("/Users/Longbiao/Projects/taxidb/taxi.db;", &db);
    const char *update = "update TAXI_GPS_TRACK_1 set STATUS = ?, TIMESTAMP = ? where rowid = ?;";
    sqlite3_prepare_v2(db,update,(int)strlen(update),&stmt,0);
    
    sqlite3_exec(db, "begin;", 0, 0, 0);
    sqlite3_exec(db, "select *,rowid from TAXI_GPS_TRACK_1;", callback, NULL, &msg);
    sqlite3_finalize(stmt);
    
    sqlite3_exec(db, "commit;", 0, 0, 0);
    sqlite3_close(db);
    
    time_t done = time(0);
    printf("%lu\n", (done - launch));
    printf("Done.\n");
}
