package com.saltdamage.repository;

import com.saltdamage.dto.EnvDataVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.jdbc.core.BeanPropertyRowMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public class EnvDataRepository {

    @Autowired
    @Qualifier("clickhouseJdbcTemplate")
    private JdbcTemplate jdbcTemplate;

    public void save(EnvDataVO envData) {
        String sql = "INSERT INTO env_data (id, chamber_id, chamber_name, device_id, device_code, device_name, " +
                "temperature, humidity, co2_concentration, illuminance, air_pressure, wind_speed, collect_time, create_time) " +
                "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        jdbcTemplate.update(sql,
                envData.getId(),
                envData.getChamberId(),
                envData.getChamberName(),
                envData.getDeviceId(),
                envData.getDeviceCode(),
                envData.getDeviceName(),
                envData.getTemperature(),
                envData.getHumidity(),
                envData.getCo2Concentration(),
                envData.getIlluminance(),
                envData.getAirPressure(),
                envData.getWindSpeed(),
                envData.getCollectTime(),
                envData.getCreateTime()
        );
    }

    public List<EnvDataVO> findByChamberIdAndTimeRange(Long chamberId, LocalDateTime startTime, LocalDateTime endTime) {
        String sql = "SELECT * FROM env_data WHERE chamber_id = ? AND collect_time >= ? AND collect_time <= ? ORDER BY collect_time DESC";
        return jdbcTemplate.query(sql, new BeanPropertyRowMapper<>(EnvDataVO.class), chamberId, startTime, endTime);
    }

    public List<EnvDataVO> findByDeviceIdAndTimeRange(Long deviceId, LocalDateTime startTime, LocalDateTime endTime) {
        String sql = "SELECT * FROM env_data WHERE device_id = ? AND collect_time >= ? AND collect_time <= ? ORDER BY collect_time DESC";
        return jdbcTemplate.query(sql, new BeanPropertyRowMapper<>(EnvDataVO.class), deviceId, startTime, endTime);
    }

    public EnvDataVO findLatestByChamberId(Long chamberId) {
        String sql = "SELECT * FROM env_data WHERE chamber_id = ? ORDER BY collect_time DESC LIMIT 1";
        List<EnvDataVO> list = jdbcTemplate.query(sql, new BeanPropertyRowMapper<>(EnvDataVO.class), chamberId);
        return list.isEmpty() ? null : list.get(0);
    }

    public EnvDataVO findLatestByDeviceId(Long deviceId) {
        String sql = "SELECT * FROM env_data WHERE device_id = ? ORDER BY collect_time DESC LIMIT 1";
        List<EnvDataVO> list = jdbcTemplate.query(sql, new BeanPropertyRowMapper<>(EnvDataVO.class), deviceId);
        return list.isEmpty() ? null : list.get(0);
    }

    public List<EnvDataVO> findLatestListByChamberId(Long chamberId, int limit) {
        String sql = "SELECT * FROM env_data WHERE chamber_id = ? ORDER BY collect_time DESC LIMIT ?";
        return jdbcTemplate.query(sql, new BeanPropertyRowMapper<>(EnvDataVO.class), chamberId, limit);
    }
}
