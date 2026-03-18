port running on 3004

tests:
1. test GET
run ```GET http://localhost:3004/fare-service/```
returns: fare service is running


2. insert trunk bus values
run ```POST http://localhost:3004/fare-service/import/trunk-bus```

2. insert mrt-lrt values
run ```POST http://localhost:3004/fare-service/import/mrt-lrt```


3. check input
run ```GET http://localhost:3004/fare-service/rules```


notes: when posting steps 2 and 3 repeatedly, postgres ID will increase, ultimately should not affect calling of data