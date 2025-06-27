package com.example.fms_worker;

import static android.view.ViewGroup.LayoutParams.WRAP_CONTENT;

import android.os.Bundle;

import androidx.activity.EdgeToEdge;
import androidx.appcompat.app.AppCompatActivity;
import androidx.constraintlayout.widget.ConstraintLayout;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;
import android.widget.Button;
import android.content.Intent;
import android.view.View;
import android.widget.LinearLayout;
import android.widget.RelativeLayout;
import android.widget.TextView;

import org.w3c.dom.Text;

import java.util.ArrayList;
import java.util.HashMap;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;
import retrofit2.Retrofit;
import retrofit2.converter.gson.GsonConverterFactory;

public class MainActivity extends AppCompatActivity {
    public String location;
    public int worker_id;

    public RelativeLayout work_queue;
    public TextView assigned_location;
    public TextView first_tab;
    public Button button;
    public Button signOut;
    public Retrofit retrofit;
    public RetrofitInterface retrofitInterface;
    public String BASE_URL="https://fmsbackend-iiitd.up.railway.app/";

    @Override
    protected void onCreate(Bundle savedInstanceState) {

        super.onCreate(savedInstanceState);
        EdgeToEdge.enable(this);
        setContentView(R.layout.activity_main);

        Intent intent=getIntent();
        location= intent.getStringExtra(MainActivity4.TEXT_TO_SEND);
        worker_id=intent.getIntExtra(MainActivity4.INT_TO_SEND,0);
        if (location==null || location.equals("")) location="General";
        assigned_location=(TextView) findViewById(R.id.location);
//        first_tab=(TextView) findViewById(R.id.first_tab);
        assigned_location.setText(location);
        button= (Button) findViewById(R.id.button3);
        signOut=(Button) findViewById(R.id.signOut);
        work_queue= (RelativeLayout) findViewById(R.id.work_queue);
        signOut.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Intent intent=new Intent(MainActivity.this, MainActivity4.class);
                startActivity(intent);

            }
        });
        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.main), (v, insets) -> {
            Insets systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars());
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom);
            return insets;
        });

        retrofit= new Retrofit.Builder()
                .baseUrl(BASE_URL)
                .addConverterFactory(GsonConverterFactory.create())
                .build();

        retrofitInterface= retrofit.create(RetrofitInterface.class);

        handleWorkQueue();
    }

    private void handleWorkQueue() {
        if (worker_id==0) return;
        HashMap<String, String> map=new HashMap<>();
        map.put("WorkerID", String.valueOf(worker_id));

        Call<WorkQueue> call= retrofitInterface.executeWorkQueue(map);
        call.enqueue(new Callback<WorkQueue>() {
            @Override
            public void onResponse(Call<WorkQueue> call, Response<WorkQueue> response) {
                if (response.code()!=400 && response.code()!=500){ //work queue fetched good
                    WorkQueue queue= response.body();
                    if (queue.getQueue().size()>0){
                        setQueue(queue.getQueue());

                    }
                    else{
                        ConstraintLayout text=(ConstraintLayout) getLayoutInflater().inflate(R.layout.work_queue_empty, null);


                        ConstraintLayout.LayoutParams layoutParams = new ConstraintLayout.LayoutParams(
                                ConstraintLayout.LayoutParams.WRAP_CONTENT,
                                ConstraintLayout.LayoutParams.WRAP_CONTENT
                        );
                        layoutParams.setMargins(45, 25, 0, 0);
                        work_queue.addView(text, layoutParams);
                    }
                }
            }

            @Override
            public void onFailure(Call<WorkQueue> call, Throwable t) {

            }
        });
    }

    int x=25;
    private void setQueue(ArrayList<String> queue) {

        for (int i=0; i<queue.size(); i++) {
            ConstraintLayout work_tab;
            String[] parts= queue.get(i).split(",");
            if (i==0) {
                work_tab = (ConstraintLayout) getLayoutInflater().inflate(R.layout.work_card, null);
                ((Button) work_tab.findViewById(R.id.tick)).setOnClickListener(new View.OnClickListener() {
                    @Override
                    public void onClick(View v) {
                        HashMap<String, String> map= new HashMap<>();
                        map.put("worker_id",String.valueOf(worker_id));
                        map.put("building", parts[1]);
                        map.put("room_no", parts[0]);
                        map.put("request_time", parts[2]);

                        Call<Void> call=retrofitInterface.markCompleted(map);
                        call.enqueue(new Callback<Void>() {
                            @Override
                            public void onResponse(Call<Void> call, Response<Void> response) {

                            }

                            @Override
                            public void onFailure(Call<Void> call, Throwable t) {

                            }
                        });

                        work_queue.removeAllViewsInLayout();
                        x=25;
                        for (int i=0; i<1000000; i++){;}
                        work_queue.invalidate();
                        handleWorkQueue();
                        work_queue.invalidate();
                    }
                });
            }
            else{
                work_tab= (ConstraintLayout) getLayoutInflater().inflate(R.layout.work_card_inactive, null);
            }

            String to_display=parts[0]+" "+parts[1];
            work_tab.setClickable(true);
            ((TextView) work_tab.findViewById(R.id.textid)).setText(to_display);
            ConstraintLayout.LayoutParams layoutParams = new ConstraintLayout.LayoutParams(
                    ConstraintLayout.LayoutParams.WRAP_CONTENT,
                    ConstraintLayout.LayoutParams.WRAP_CONTENT
            );
            layoutParams.setMargins(45, x, 0, 0);  // Replace with your desired top margin in pixels
            if (i!=0){
                work_tab.setBackground(getResources().getDrawable(R.drawable.shape3));
            }
            work_queue.addView(work_tab, layoutParams);
            x+=185;
        }



    }
}