#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <sqlite3.h>
#include <time.h>


sqlite3 *dbin, *dbout;
sqlite3_stmt *stmt;


static int callback(void *data, int ncol, char **values, char **names){
    
    sqlite3_reset(stmt);
    
    sqlite3_bind_int(stmt,1,atoi(values[0]));
    sqlite3_bind_int(stmt,2,atoi(values[1]));
    sqlite3_bind_int(stmt,3,atoi(values[2]));
    sqlite3_bind_int(stmt,4,atoi(values[3]));
    sqlite3_bind_int(stmt,5,atoi(values[4]));
    sqlite3_bind_int(stmt,6,atoi(values[5]));
    sqlite3_bind_int(stmt,7,atoi(values[6]));
    sqlite3_bind_int(stmt,8,atoi(values[7]));
    
    sqlite3_step(stmt);
    
    return 0;
}

int main(int argc, char* argv[]){
    
    time_t launch = time(0);
    
    printf("Preparing tables...\n");
    sqlite3_open("/Users/Longbiao/Projects/typhoon/taxi2.db", &dbout);
    sqlite3_exec(dbout, "BEGIN;", NULL, NULL, NULL);
    sqlite3_exec(dbout, "DELETE FROM trajectory", NULL, NULL, NULL);
    
    const char *insert = "INSERT INTO trajectory VALUES (?,?,?,?,?,?,?,?)";
    sqlite3_prepare_v2(dbout, insert, (int)strlen(insert), &stmt,NULL);
    sqlite3_open("/Users/Longbiao/Projects/typhoon/taxi.db", &dbin);
    printf("Processing table trajectory...\n");
    sqlite3_exec(dbin, "SELECT * FROM trajectory", callback, NULL, NULL);
    printf("Committing changes...\n");
    sqlite3_finalize(stmt);
    
    sqlite3_exec(dbout, "COMMIT;", NULL, NULL, NULL);
    sqlite3_close(dbin);
    sqlite3_close(dbout);
    
    time_t done = time(0);
    printf("Done in %lu seconds.\n", (done - launch));
}




