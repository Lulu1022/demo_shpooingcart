package lulu.com.demo_shpooingcart.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;

import java.sql.Timestamp;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MyOrderItemResponse {
    private Integer orderId;
    private Integer userId;
    private Integer totalAmount;
    private Timestamp createTime;
    private Integer vendorId;
    private Timestamp pickTime;
    private Integer productId;
    private Integer quantity;
    private Integer price;
    private String pickAddress;
    private String productName;
    private String shopName;
    private String username;
    private String email;

}