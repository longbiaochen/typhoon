#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <sqlite3.h>
#include <time.h>


sqlite3 *dbin, *dbout;
sqlite3_stmt *stmt;


static int callback(void *data, int ncol, char **values, char **names){
    
    sqlite3_reset(stmt);
    
    sqlite3_bind_int(stmt,1,atoi(values[1]));
    sqlite3_bind_int(stmt,2,atoi(values[22]));
    sqlite3_bind_int(stmt,3,atoi(values[21]));
    sqlite3_bind_int(stmt,4,atoi(values[6]));
    sqlite3_bind_int(stmt,5,atoi(values[7]));
    sqlite3_bind_int(stmt,6,atoi(values[8]));
    sqlite3_bind_int(stmt,7,atoi(values[9]));
    sqlite3_bind_int(stmt,8,atoi(values[10]));
    
    sqlite3_step(stmt);
    
    return 0;
}

int main(int argc, char* argv[]){
    
    time_t launch = time(0);
    
    printf("Preparing tables...\n");
    sqlite3_open("/Users/Longbiao/Projects/merge_table/taxi.db", &dbout);
    sqlite3_exec(dbout, "BEGIN;", NULL, NULL, NULL);
    sqlite3_exec(dbout, "DELETE FROM trajectory", NULL, NULL, NULL);
    
    const char *insert = "INSERT INTO trajectory VALUES (?,?,?,?,?,?,?,?)";
    sqlite3_prepare_v2(dbout, insert, (int)strlen(insert), &stmt,NULL);
    sqlite3_open("/Users/Longbiao/Projects/taxidb/raw.db", &dbin);
    printf("Processing table 1...\n");
    sqlite3_exec(dbin, "SELECT * FROM TAXI_GPS_TRACK_1", callback, NULL, NULL);
    printf("Processing table 2...\n");
    sqlite3_exec(dbin, "SELECT * FROM TAXI_GPS_TRACK_2", callback, NULL, NULL);
    printf("Processing table 3...\n");
    sqlite3_exec(dbin, "SELECT * FROM TAXI_GPS_TRACK_3", callback, NULL, NULL);
    printf("Committing changes...\n");
    
    sqlite3_finalize(stmt);
    
    sqlite3_exec(dbout, "COMMIT;", NULL, NULL, NULL);
    sqlite3_close(dbin);
    sqlite3_close(dbout);
    
    time_t done = time(0);
    printf("Done in %lu seconds.\n", (done - launch));
}




