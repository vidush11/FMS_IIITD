package com.example.fms_worker;

import java.util.ArrayList;

public class LoginResult {
    private String role;
    private int worker_id;
    private String assigned_location;

    String getRole(){
        return role;
    }
    int getWorker_id(){
        return worker_id;
    }

    String getAssigned_location(){
        return assigned_location;
    }
}
