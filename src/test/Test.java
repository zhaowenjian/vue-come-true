public class Test {
  public void test () {
    Integer int1 = 3;
    Integer int2 = 3;
    System.out.println(int1 == int2);

    Integer int3 = 300;
    Integer int4 = 300;
    System.out.println(int3 == int4);

    // long l = (long)14992442817379172354;

    // System.out.println(l);

    byte a = 1;
    short b = 127;
    a = (byte)(a + b);
    System.out.println(a);
  }
  public static void main (String[] strings) {
    new Test().test();
  }
}