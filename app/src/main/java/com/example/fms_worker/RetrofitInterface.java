package com.example.fms_worker;

import java.util.HashMap;

import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.POST;

public interface RetrofitInterface {
    @POST("worker/login")
    Call<LoginResult> executeLogin(@Body HashMap<String, String> map);

    @POST("worker/work-queue")
    Call<WorkQueue> executeWorkQueue(@Body HashMap<String, String> map);

    @POST("worker/mark-completed")
    Call<Void> markCompleted(@Body HashMap<String, String> map);

    @POST("worker/create-order")
    Call<Void> createOrder(@Body HashMap<String, String> map);
}
