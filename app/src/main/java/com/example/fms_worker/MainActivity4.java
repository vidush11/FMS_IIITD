package com.example.fms_worker;

import android.os.Bundle;

import androidx.activity.EdgeToEdge;
import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;

import android.view.KeyEvent;
import android.widget.Button;
import android.content.Intent;
import android.view.View;
import android.widget.EditText;
import android.widget.TextView;
import android.widget.Toast;

import java.util.HashMap;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;
import retrofit2.Retrofit;
import retrofit2.converter.gson.GsonConverterFactory;

public class MainActivity4 extends AppCompatActivity {
    public static final String TEXT_TO_SEND="com.example.fms_worker.TEXT_TO_SEND";
    public static final String INT_TO_SEND="com.example.fms_worker.INT_TO_SEND";
    public Button button;
    public EditText worker_id;
    public EditText password;

    public Retrofit retrofit;
    public RetrofitInterface retrofitInterface;
    public String BASE_URL="https://fmsbackend-iiitd.up.railway.app/";
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        EdgeToEdge.enable(this);
        setContentView(R.layout.activity_main4);
        button= (Button) findViewById(R.id.button16);
        worker_id= (EditText) findViewById(R.id.worker_id);
        password=(EditText) findViewById(R.id.worker_password);

        worker_id.requestFocus();
        worker_id.setOnEditorActionListener(new TextView.OnEditorActionListener() {
            @Override
            public boolean onEditorAction(TextView v, int actionId, KeyEvent event) {
                if (event==null || event.getAction() != KeyEvent.ACTION_DOWN) return true;
                System.out.println("pressed");
                password.requestFocus();
                return true;
            }
        });
        password.setOnEditorActionListener(new TextView.OnEditorActionListener() {
            @Override
            public boolean onEditorAction(TextView v, int actionId, KeyEvent event) {
                if (event==null || event.getAction() != KeyEvent.ACTION_DOWN) return true;
                System.out.println("pressed");
                button.performClick();
                return true;
            }
        });
        retrofit= new Retrofit.Builder()
                .baseUrl(BASE_URL)
                .addConverterFactory(GsonConverterFactory.create())
                .build();

        retrofitInterface= retrofit.create(RetrofitInterface.class);
        button.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                handleLoginDialog();
            }
        });

        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.main), (v, insets) -> {
            Insets systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars());
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom);
            return insets;
        });
    }

    private void handleLoginDialog() {
        HashMap<String, String> map= new HashMap<>();
        if (worker_id.getText().toString().strip().equals("") || password.getText().toString().strip().equals("")){
            Toast.makeText(MainActivity4.this, "Atleast one of the fields is empty!", Toast.LENGTH_LONG).show();
            return;
        }
        map.put("Worker_ID",worker_id.getText().toString().strip());
        map.put("WorkerPassword", password.getText().toString());

        Call<LoginResult> call= retrofitInterface.executeLogin(map);
        call.enqueue(new Callback<LoginResult>() {
            @Override
            public void onResponse(Call<LoginResult> call, Response<LoginResult> response) {
                if (response.code()!=401) { //login successful
                    LoginResult result = response.body();
                    if (result.getRole().equals("Guard")) {
                        Intent intent = new Intent(MainActivity4.this, MainActivity2.class);
                        intent.putExtra(TEXT_TO_SEND, result.getAssigned_location());
                        intent.putExtra(INT_TO_SEND, result.getWorker_id());
                        startActivity(intent);
                    }
                    else{
                        Intent intent = new Intent(MainActivity4.this, MainActivity.class);
                        intent.putExtra(TEXT_TO_SEND, result.getAssigned_location());
                        intent.putExtra(INT_TO_SEND, result.getWorker_id());
                        startActivity(intent);
                    }

//                    AlertDialog.Builder builder1 = new AlertDialog.Builder(MainActivity4.this);
//                    builder1.setTitle(result.getWorker_id());
//                    builder1.setMessage(result.getAssigned_location());
//                    builder1.show();
                }
                else{
                    Toast.makeText(MainActivity4.this, "Incorrect credentials, please try again!", Toast.LENGTH_LONG).show();
                }
            }

            @Override
            public void onFailure(Call<LoginResult> call, Throwable t) {

            }
        });
    }
}