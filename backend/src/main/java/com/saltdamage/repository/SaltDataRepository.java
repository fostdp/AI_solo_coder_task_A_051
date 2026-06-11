package com.saltdamage.repository;

import com.saltdamage.dto.SaltDataVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.jdbc.core.BeanPropertyRowMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public class SaltDataRepository {

    @Autowired
    @Qualifier("clickhouseJdbcTemplate")
    private JdbcTemplate jdbcTemplate;

    public void save(SaltDataVO saltData) {
        String sql = "INSERT INTO salt_data (id, chamber_id, chamber_name, device_id, device_code, device_name, " +
                "salt_concentration, conductivity, ph_value, temperature, humidity, collect_time, create_time) " +
                "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        jdbcTemplate.update(sql,
                saltData.getId(),
                saltData.getChamberId(),
                saltData.getChamberName(),
                saltData.getDeviceId(),
                saltData.getDeviceCode(),
                saltData.getDeviceName(),
                saltData.getSaltConcentration(),
                saltData.getConductivity(),
                saltData.getPhValue(),
                saltData.getTemperature(),
                saltData.getHumidity(),
                saltData.getCollectTime(),
                saltData.getCreateTime()
        );
    }

    public List<SaltDataVO> findByChamberIdAndTimeRange(Long chamberId, LocalDateTime startTime, LocalDateTime endTime) {
        String sql = "SELECT * FROM salt_data WHERE chamber_id = ? AND collect_time >= ? AND collect_time <= ? ORDER BY collect_time DESC";
        return jdbcTemplate.query(sql, new BeanPropertyRowMapper<>(SaltDataVO.class), chamberId, startTime, endTime);
    }

    public List<SaltDataVO> findByDeviceIdAndTimeRange(Long deviceId, LocalDateTime startTime, LocalDateTime endTime) {
        String sql = "SELECT * FROM salt_data WHERE device_id = ? AND collect_time >= ? AND collect_time <= ? ORDER BY collect_time DESC";
        return jdbcTemplate.query(sql, new BeanPropertyRowMapper<>(SaltDataVO.class), deviceId, startTime, endTime);
    }

    public SaltDataVO findLatestByChamberId(Long chamberId) {
        String sql = "SELECT * FROM salt_data WHERE chamber_id = ? ORDER BY collect_time DESC LIMIT 1";
        List<SaltDataVO> list = jdbcTemplate.query(sql, new BeanPropertyRowMapper<>(SaltDataVO.class), chamberId);
        return list.isEmpty() ? null : list.get(0);
    }

    public SaltDataVO findLatestByDeviceId(Long deviceId) {
        String sql = "SELECT * FROM salt_data WHERE device_id = ? ORDER BY collect_time DESC LIMIT 1";
        List<SaltDataVO> list = jdbcTemplate.query(sql, new BeanPropertyRowMapper<>(SaltDataVO.class), deviceId);
        return list.isEmpty() ? null : list.get(0);
    }

    public List<SaltDataVO> findLatestListByChamberId(Long chamberId, int limit) {
        String sql = "SELECT * FROM salt_data WHERE chamber_id = ? ORDER BY collect_time DESC LIMIT ?";
        return jdbcTemplate.query(sql, new BeanPropertyRowMapper<>(SaltDataVO.class), chamberId, limit);
    }
}
