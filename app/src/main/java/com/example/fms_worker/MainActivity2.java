package com.example.fms_worker;

import android.content.DialogInterface;
import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Spinner;
import android.widget.TextView;
import android.widget.Toast;

import androidx.activity.EdgeToEdge;
import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;

import java.util.HashMap;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;
import retrofit2.Retrofit;
import retrofit2.converter.gson.GsonConverterFactory;

public class MainActivity2 extends AppCompatActivity {
    public String location;
    public int worker_id;
    public TextView assigned_location;
    public Retrofit retrofit;
    public RetrofitInterface retrofitInterface;
    public String BASE_URL="https://fmsbackend-iiitd.up.railway.app/";
    public EditText studentRollNo;
    public Button saveButton;
    public Button signOut;
    public Spinner spinner;
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        EdgeToEdge.enable(this);
        setContentView(R.layout.activity_main2);
        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.main), (v, insets) -> {
            Insets systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars());
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom);
            return insets;
        });

        Intent intent=getIntent();
        worker_id=intent.getIntExtra(MainActivity4.INT_TO_SEND,0);
        studentRollNo=(EditText) findViewById(R.id.studentRollNumber);
        location= intent.getStringExtra(MainActivity4.TEXT_TO_SEND);
        if (location==null || location.equals("")) location="General";

        assigned_location=(TextView) findViewById(R.id.location);

        assigned_location.setText(location);

        saveButton= (Button) findViewById(R.id.saveOrder);
        signOut= (Button) findViewById(R.id.signOut);
        spinner= (Spinner) findViewById(R.id.spinner1);
        retrofit= new Retrofit.Builder()
                .baseUrl(BASE_URL)
                .addConverterFactory(GsonConverterFactory.create())
                .build();

        retrofitInterface= retrofit.create(RetrofitInterface.class);

        saveButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                saveOrder();
            }
        });

        signOut.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Intent intent = new Intent(MainActivity2.this, MainActivity4.class);

                startActivity(intent);
            }
        });
        //get the spinner from the xml.
        Spinner dropdown = findViewById(R.id.spinner1);
//create a list of items for the spinner.
        String[] items = new String[]{"H1 boys hostel", "H2 boys hostel", "Old Academic", "LHC complex", "Girls Hostel", "Faculty Residence", "R&D block","Old Boys Hostel"};
//create an adapter to describe how the items are displayed, adapters are used in several places in android.
//There are multiple variations of this, but this is the basic variant.
        ArrayAdapter<String> adapter = new ArrayAdapter<>(this, android.R.layout.simple_spinner_dropdown_item, items);
//set the spinners adapter to the previously created one.
        dropdown.setAdapter(adapter);
    }

    void saveOrder(){
        if (studentRollNo.getText().toString().strip().equals("")) {
            Toast.makeText(MainActivity2.this, "Student roll number can not be empty!", Toast.LENGTH_LONG).show();
            return;}
        HashMap<String, String> map= new HashMap<>();
        map.put("worker_id",String.valueOf(worker_id));
        map.put("user_id", studentRollNo.getText().toString().strip());
        map.put("location", spinner.getSelectedItem().toString());

        Call<Void> call= retrofitInterface.createOrder(map);
        call.enqueue(new Callback<Void>() {
            @Override
            public void onResponse(Call<Void> call, Response<Void> response) {
                if (response.code()==201){
                    studentRollNo.setText("");
                    AlertDialog aboutDialog= new AlertDialog.Builder(MainActivity2.this).create();
                    aboutDialog.setTitle("Order Created Successfully");
                    aboutDialog.setMessage("(c)2025 FMS.");
                    aboutDialog.setButton(AlertDialog.BUTTON_NEUTRAL, "OK", new DialogInterface.OnClickListener(){

                        @Override
                        public void onClick(DialogInterface dialog, int which) {
                            dialog.dismiss();
                        }
                    });
                    aboutDialog.show();

                }
                else{
                    Toast.makeText(MainActivity2.this, "Could not create the order. Please try again!", Toast.LENGTH_LONG).show();
                }
            }

            @Override
            public void onFailure(Call<Void> call, Throwable t) {

            }
        });

    }
}