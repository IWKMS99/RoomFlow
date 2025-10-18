package iwkms.roomflow.roomflow;

import org.springframework.boot.SpringApplication;

public class TestRoomFlowApplication {

    public static void main(String[] args) {
        SpringApplication.from(RoomFlowApplication::main).with(TestcontainersConfiguration.class).run(args);
    }

}
