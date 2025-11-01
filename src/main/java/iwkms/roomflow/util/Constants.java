package iwkms.roomflow.util;

import java.time.LocalTime;
import java.util.UUID;

public final class Constants {

    private Constants() {}

    public static final class Test {
        public static final UUID ROOM_A_ID = UUID.fromString("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa");
        public static final UUID USER_ID_1 = UUID.fromString("00000000-0000-0000-0000-000000000001");
        public static final UUID USER_ID_2 = UUID.fromString("00000000-0000-0000-0000-000000000002");
        public static final UUID USER_ID_3 = UUID.fromString("00000000-0000-0000-0000-000000000003");
        public static final UUID USER_ID_4 = UUID.fromString("00000000-0000-0000-0000-000000000004");
    }

    public static final class Schedule {
        public static final LocalTime WORKING_DAY_START = LocalTime.of(9, 0);
        public static final LocalTime WORKING_DAY_END = LocalTime.of(18, 0);
    }
}
